import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const rows = await db.select().from(schema.domainRecords).where(and(
    eq(schema.domainRecords.ownerId, user.id),
    eq(schema.domainRecords.isDeleted, false),
  )).orderBy(desc(schema.domainRecords.updatedAt))

  return rows.map(item => ({
    id: item.id,
    domain: item.domain,
    registrar: item.registrar,
    accountName: item.accountName,
    expiresAt: item.expiresAt,
    autoRenew: item.autoRenew,
    notes: item.notesEncrypted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))
})
