import { db, schema } from 'hub:db'
import { desc, eq } from 'drizzle-orm'

export default eventHandler(async () => {
  return db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.isDeleted, false))
    .orderBy(desc(schema.messages.createdAt))
})
