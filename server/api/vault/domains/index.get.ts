import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { domainToUnicode } from 'node:url'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const rows = await db.select().from(schema.domainRecords).where(and(
    eq(schema.domainRecords.ownerId, user.id),
    eq(schema.domainRecords.isDeleted, false),
  )).orderBy(desc(schema.domainRecords.updatedAt))

  return rows.map(item => ({
    id: item.id,
    domain: domainToUnicode(item.domain),
    registrar: item.registrar,
    accountName: item.accountName,
    startTime: item.startTime,
    expiresAt: item.expiresAt,
    price: item.price,
    currency: item.currency,
    autoRenew: item.autoRenew,
    notes: item.notesEncrypted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))
})
