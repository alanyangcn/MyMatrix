import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    websiteId?: number
    accountName?: string
    loginIdentifier?: string
    notes?: string
  }>(event)

  if (!id || !body.websiteId || !body.accountName?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid id, website, and account name are required.',
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

  await db.update(schema.websiteAccountRecords)
    .set({
      websiteId: website.id,
      accountName: body.accountName.trim(),
      loginIdentifier: body.loginIdentifier?.trim() || null,
      notesEncrypted: body.notes?.trim() || null,
      updatedBy: user.id,
      updatedAt: Date.now(),
    })
    .where(and(
      eq(schema.websiteAccountRecords.id, id),
      eq(schema.websiteAccountRecords.ownerId, user.id),
      eq(schema.websiteAccountRecords.isDeleted, false),
    ))

  return {}
})
