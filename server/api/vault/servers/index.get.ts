import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const rows = await db.select().from(schema.serverRecords).where(and(
    eq(schema.serverRecords.ownerId, user.id),
    eq(schema.serverRecords.isDeleted, false),
  )).orderBy(desc(schema.serverRecords.updatedAt))

  return rows.map(item => ({
    id: item.id,
    name: item.name,
    provider: item.provider,
    ipAddress: item.ipAddress,
    loginName: item.loginName,
    panelUrl: item.panelUrl,
    expiresAt: item.expiresAt,
    remindAt: item.remindAt,
    notes: item.notesEncrypted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))
})
