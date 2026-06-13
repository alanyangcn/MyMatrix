import { domainToUnicode } from 'node:url'

export function normalizeDomainInput(value: string) {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return ''

  let hostname = ''
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
    hostname = url.hostname.replace(/^www\./, '')
  }
  catch {
    const segment = trimmed.replace(/^https?:\/\//i, '').split('/')[0] || ''
    const cleanQuery = segment.split('?')[0] || ''
    const cleanHash = cleanQuery.split('#')[0] || ''
    hostname = cleanHash.replace(/^www\./, '')
  }
  return domainToUnicode(hostname)
}
