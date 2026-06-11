import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    websiteId?: number
    accountName?: string
    loginIdentifier?: string
    notes?: string
  }>(event)

  if (!body.websiteId || !body.accountName?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Website and account name are required.',
    })
  }

  const [website] = await db.select({ id: schema.websiteRecords.id }).from(schema.websiteRecords).where(and(
    eq(schema.websiteRecords.id, body.websiteId),
    eq(schema.websiteRecords.ownerId, user.id),
    eq(schema.websiteRecords.isDeleted, false),
  )).limit(1)

  if (!website) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Website was not found.',
    })
  }

  const now = Date.now()
  await db.insert(schema.websiteAccountRecords).values({
    ownerId: user.id,
    websiteId: website.id,
    accountName: body.accountName.trim(),
    loginIdentifier: body.loginIdentifier?.trim(),
    passwordEncrypted: null,
    notesEncrypted: body.notes?.trim() || null,
    createdBy: user.id,
    createdAt: now,
    updatedBy: user.id,
    updatedAt: now,
    isDeleted: false,
  })

  return {}
})
