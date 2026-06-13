import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    domain?: string
    registrar?: string
    accountName?: string
    startTime?: number | null
    expiresAt?: number | null
    price?: string
    currency?: string
    autoRenew?: boolean
    notes?: string
  }>(event)

  if (!id || !body.domain?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid id and domain are required.',
    })
  }

  const domain = normalizeDomainInput(body.domain)
  if (!domain) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid id and domain are required.',
    })
  }

  await db.update(schema.domainRecords)
    .set({
      domain,
      registrar: body.registrar?.trim() || null,
      accountName: body.accountName?.trim() || null,
      startTime: body.startTime || null,
      expiresAt: body.expiresAt || null,
      price: body.price?.trim() || null,
      currency: body.currency?.trim() || null,
      remindAt: null,
      autoRenew: Boolean(body.autoRenew),
      notesEncrypted: body.notes?.trim() || null,
      updatedBy: user.id,
      updatedAt: Date.now(),
    })
    .where(and(
      eq(schema.domainRecords.id, id),
      eq(schema.domainRecords.ownerId, user.id),
      eq(schema.domainRecords.isDeleted, false),
    ))

  return {}
})
