import { and, count, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const body = await readBody<{
    username?: string
    password?: string
  }>(event)

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
  const [userCount] = await db
    .select({ total: count() })
    .from(schema.users)
    .where(eq(schema.users.isDeleted, false))
  const total = userCount?.total || 0

  const currentUser = total > 0 ? await requireUser(event) : null
  if (total > 0 && currentUser?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only admins can create more users.',
    })
  }

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
})
