import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const { text } = await readBody(event)
  const user = await getCurrentUser(event)
  const now = Date.now()

  await db.insert(schema.messages).values({
    text,
    createdAt: now,
    createdBy: user?.id,
    updatedAt: now,
    updatedBy: user?.id,
    isDeleted: false,
  })

  return {}
})
