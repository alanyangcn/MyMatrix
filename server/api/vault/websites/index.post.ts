import { db, schema } from 'hub:db'

function normalizeWebsiteUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function normalizeWebsiteNotes(value?: string) {
  return value?.trim() || null
}

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    name?: string
    url?: string
    notes?: string
  }>(event)

  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Website name is required.',
    })
  }

  const now = Date.now()
  await db.insert(schema.websiteRecords).values({
    ownerId: user.id,
    name: body.name.trim(),
    url: normalizeWebsiteUrl(body.url),
    notesEncrypted: normalizeWebsiteNotes(body.notes),
    createdBy: user.id,
    createdAt: now,
    updatedBy: user.id,
    updatedAt: now,
    isDeleted: false,
  })

  return {}
})
