import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    name?: string
    provider?: string
    ipAddress?: string
    loginName?: string
    panelUrl?: string
    expiresAt?: number | null
    remindAt?: number | null
    notes?: string
  }>(event)

  if (!id || !body.name?.trim() || !body.ipAddress?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid id, server name, and IP address are required.',
    })
  }

  await db.update(schema.serverRecords)
    .set({
      name: body.name.trim(),
      provider: body.provider?.trim(),
      ipAddress: body.ipAddress.trim(),
      loginName: body.loginName?.trim(),
      panelUrl: body.panelUrl?.trim(),
      expiresAt: body.expiresAt || null,
      remindAt: body.remindAt || null,
      notesEncrypted: body.notes?.trim() || null,
      updatedBy: user.id,
      updatedAt: Date.now(),
    })
    .where(and(
      eq(schema.serverRecords.id, id),
      eq(schema.serverRecords.ownerId, user.id),
      eq(schema.serverRecords.isDeleted, false),
    ))

  return {}
})
