import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

function normalizeWebsiteUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    name?: string
    url?: string
    notes?: string
  }>(event)

  if (!id || !body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid id and website name are required.',
    })
  }

  await db.update(schema.websiteRecords)
    .set({
      name: body.name.trim(),
      url: normalizeWebsiteUrl(body.url),
      notesEncrypted: body.notes?.trim() || null,
      updatedBy: user.id,
      updatedAt: Date.now(),
    })
    .where(and(
      eq(schema.websiteRecords.id, id),
      eq(schema.websiteRecords.ownerId, user.id),
      eq(schema.websiteRecords.isDeleted, false),
    ))

  return {}
})
