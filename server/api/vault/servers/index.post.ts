import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    name?: string
    provider?: string
    ipAddress?: string
    loginName?: string
    panelUrl?: string
    startTime?: number | null
    expiresAt?: number | null
    price?: string
    currency?: string
    autoRenew?: boolean
    remindAt?: number | null
    notes?: string
  }>(event)

  if (!body.name?.trim() || !body.ipAddress?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Server name and IP address are required.',
    })
  }

  const now = Date.now()
  await db.insert(schema.serverRecords).values({
    ownerId: user.id,
    name: body.name.trim(),
    provider: body.provider?.trim(),
    ipAddress: body.ipAddress.trim(),
    loginName: body.loginName?.trim(),
    panelUrl: body.panelUrl?.trim(),
    startTime: body.startTime || null,
    expiresAt: body.expiresAt || null,
    price: body.price?.trim() || null,
    currency: body.currency?.trim() || null,
    remindAt: body.remindAt || null,
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
