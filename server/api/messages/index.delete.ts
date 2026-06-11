import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { messageID } = await readBody(event)
  const user = await getCurrentUser(event)
  const now = Date.now()

  await db.update(schema.messages)
    .set({
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
      updatedBy: user?.id,
    })
    .where(eq(schema.messages.id, messageID))

  return {}
})
