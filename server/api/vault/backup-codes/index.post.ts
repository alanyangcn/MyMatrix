import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    provider?: string
    accountName?: string
    codes?: string
    notes?: string
  }>(event)

  if (!body.provider?.trim() || !body.accountName?.trim() || !body.codes?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Provider, account name, and backup codes are required.',
    })
  }

  const now = Date.now()
  await db.insert(schema.backupCodeSets).values({
    ownerId: user.id,
    provider: body.provider.trim(),
    accountName: body.accountName.trim(),
    codesEncrypted: body.codes.trim(),
    notesEncrypted: body.notes?.trim() || null,
    createdBy: user.id,
    createdAt: now,
    updatedBy: user.id,
    updatedAt: now,
    isDeleted: false,
  })

  return {}
})
