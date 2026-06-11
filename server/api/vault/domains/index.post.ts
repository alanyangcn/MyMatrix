import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    domain?: string
    registrar?: string
    accountName?: string
    expiresAt?: number | null
    autoRenew?: boolean
    notes?: string
  }>(event)

  if (!body.domain?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Domain is required.',
    })
  }

  const domain = normalizeDomainInput(body.domain)
  if (!domain) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Domain is required.',
    })
  }

  const now = Date.now()
  await db.insert(schema.domainRecords).values({
    ownerId: user.id,
    domain,
    registrar: body.registrar?.trim() || null,
    accountName: body.accountName?.trim() || null,
    expiresAt: body.expiresAt || null,
    remindAt: null,
    autoRenew: Boolean(body.autoRenew),
    notesEncrypted: body.notes?.trim() || null,
    createdBy: user.id,
    createdAt: now,
    updatedBy: user.id,
    updatedAt: now,
    isDeleted: false,
  })

  return {}
})
