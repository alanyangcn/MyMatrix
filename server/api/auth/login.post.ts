import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string }>(event)
  const username = body.username?.trim().toLowerCase()
  const password = body.password || ''

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required.',
    })
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.username, username), eq(schema.users.isDeleted, false)))
    .limit(1)

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password.',
    })
  }

  const currentUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  }

  await createSession(event, currentUser)

  return { user: currentUser }
})
