import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const rows = await db.select().from(schema.backupCodeSets).where(and(
    eq(schema.backupCodeSets.ownerId, user.id),
    eq(schema.backupCodeSets.isDeleted, false),
  )).orderBy(desc(schema.backupCodeSets.updatedAt))

  return rows.map(item => ({
    id: item.id,
    provider: item.provider,
    accountName: item.accountName,
    codes: item.codesEncrypted,
    notes: item.notesEncrypted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))
})
