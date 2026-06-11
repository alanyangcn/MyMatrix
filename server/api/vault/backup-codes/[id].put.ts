import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    provider?: string
    accountName?: string
    codes?: string
    notes?: string
  }>(event)

  if (!id || !body.provider?.trim() || !body.accountName?.trim() || !body.codes?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid id, provider, account name, and backup codes are required.',
    })
  }

  await db.update(schema.backupCodeSets)
    .set({
      provider: body.provider.trim(),
      accountName: body.accountName.trim(),
      codesEncrypted: body.codes.trim(),
      notesEncrypted: body.notes?.trim() || null,
      updatedBy: user.id,
      updatedAt: Date.now(),
    })
    .where(and(
      eq(schema.backupCodeSets.id, id),
      eq(schema.backupCodeSets.ownerId, user.id),
      eq(schema.backupCodeSets.isDeleted, false),
    ))

  return {}
})
