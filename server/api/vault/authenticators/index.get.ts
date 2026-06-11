import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const rows = await db.select().from(schema.authenticators).where(and(
    eq(schema.authenticators.ownerId, user.id),
    eq(schema.authenticators.isDeleted, false),
  )).orderBy(desc(schema.authenticators.updatedAt))

  return rows.map(item => ({
    id: item.id,
    issuer: item.issuer,
    accountName: item.accountName,
    secret: item.secretEncrypted,
    notes: item.notesEncrypted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))
})
