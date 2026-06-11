const PASSWORD_ITERATIONS = 210000

export async function hashPassword(password: string) {
  const salt = randomBase64Url(16)
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64UrlToBytes(salt),
      iterations: PASSWORD_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256,
  )
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${salt}$${bytesToBase64Url(new Uint8Array(bits))}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsText, salt, expected] = storedHash.split('$')
  if (algorithm !== 'pbkdf2_sha256' || !iterationsText || !salt || !expected) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64UrlToBytes(salt),
      iterations: Number(iterationsText),
      hash: 'SHA-256',
    },
    key,
    256,
  )

  return bytesToBase64Url(new Uint8Array(bits)) === expected
}
