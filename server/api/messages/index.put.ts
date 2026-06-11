import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { messageID, text }: { messageID: number, text: string } = await readBody(event)
  const user = await getCurrentUser(event)

  await db.update(schema.messages)
    .set({
      text,
      updatedAt: Date.now(),
      updatedBy: user?.id,
    })
    .where(eq(schema.messages.id, messageID))

  return {}
})
