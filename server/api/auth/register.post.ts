import { and, count, eq } from 'drizzle-orm'
import { isError } from 'h3'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  let stage = 'read_request'

  try {
    const body = await readBody<{
      username?: string
      password?: string
    }>(event)

    stage = 'validate_input'
    const normalizedUsername = body.username?.trim().toLowerCase()
    const password = body.password || ''

    if (!normalizedUsername || !password || password.length < 10) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username and a password of at least 10 characters are required.',
      })
    }

    const username = normalizedUsername
    const displayName = username

    stage = 'count_users'
    const [userCount] = await db
      .select({ total: count() })
      .from(schema.users)
      .where(eq(schema.users.isDeleted, false))
    const total = userCount?.total || 0

    stage = 'require_admin'
    const currentUser = total > 0 ? await requireUser(event) : null
    if (total > 0 && currentUser?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only admins can create more users.',
      })
    }

    stage = 'check_existing_user'
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(and(eq(schema.users.username, username), eq(schema.users.isDeleted, false)))
      .limit(1)

    if (existing.length) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with this username already exists.',
      })
    }

    stage = 'create_user'
    const now = Date.now()
    await db.insert(schema.users).values({
      username,
      displayName,
      passwordHash: await hashPassword(password),
      role: total === 0 ? 'admin' : 'member',
      createdBy: currentUser?.id,
      createdAt: now,
      updatedBy: currentUser?.id,
      updatedAt: now,
      isDeleted: false,
    })

    stage = 'load_created_user'
    const [user] = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.username, username), eq(schema.users.isDeleted, false)))
      .limit(1)

    if (!user) {
      throw createError({
        statusCode: 500,
        statusMessage: 'User was not created.',
      })
    }

    stage = 'create_session'
    await createSession(event, {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    }
  }
  catch (error: unknown) {
    if (isError(error) && (error.statusCode || 500) < 500) throw error

    const cause = getRegisterErrorCause(error)
    console.error(`[register error] stage=${stage}`, cause)

    throw createError({
      statusCode: 500,
      statusMessage: 'Register failed',
      message: `Register failed during ${stage}: ${cause.message}`,
      data: {
        stage,
        cause,
      },
    })
  }
})

function getRegisterErrorCause(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message || 'Unknown error',
      cause: getNestedCause(error.cause),
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
  }
}

function getNestedCause(cause: unknown) {
  if (!cause) return undefined
  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
    }
  }
  if (typeof cause === 'object') return cause
  return String(cause)
}
