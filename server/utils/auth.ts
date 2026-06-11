import { and, eq, gt } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export type CurrentUser = {
  id: number
  username: string
  displayName: string
  role: string
}

const SESSION_COOKIE = 'mymatrix_session'
const SESSION_TTL = 1000 * 60 * 60 * 24 * 30

export async function createSession(event: Parameters<typeof getCookie>[0], user: CurrentUser) {
  const now = Date.now()
  const token = randomBase64Url(32)
  const tokenHash = await sha256Base64Url(token)

  await db.insert(schema.sessions).values({
    userId: user.id,
    tokenHash,
    expiresAt: now + SESSION_TTL,
    lastUsedAt: now,
    createdBy: user.id,
    createdAt: now,
    updatedBy: user.id,
    updatedAt: now,
    isDeleted: false,
  })

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: SESSION_TTL / 1000,
  })
}

export async function getCurrentUser(event: Parameters<typeof getCookie>[0]) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const tokenHash = await sha256Base64Url(token)
  const now = Date.now()
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(and(
      eq(schema.sessions.tokenHash, tokenHash),
      eq(schema.sessions.isDeleted, false),
      gt(schema.sessions.expiresAt, now),
    ))
    .limit(1)

  if (!session) return null

  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(
      eq(schema.users.id, session.userId),
      eq(schema.users.isDeleted, false),
    ))
    .limit(1)

  if (!user) return null

  await db.update(schema.sessions)
    .set({ lastUsedAt: now, updatedAt: now, updatedBy: user.id })
    .where(eq(schema.sessions.id, session.id))

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  } satisfies CurrentUser
}

export async function requireUser(event: Parameters<typeof getCookie>[0]) {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }
  return user
}

export async function clearCurrentSession(event: Parameters<typeof getCookie>[0]) {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) {
    const tokenHash = await sha256Base64Url(token)
    await db.update(schema.sessions)
      .set({ isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() })
      .where(eq(schema.sessions.tokenHash, tokenHash))
  }

  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
