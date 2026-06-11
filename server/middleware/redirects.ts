import { parseURL } from 'ufo'
import { kv } from 'hub:kv'

export default eventHandler(async (event) => {
  // Skip during prerendering
  if (import.meta.prerender) return

  const { pathname } = parseURL(event.path)
  let redirects: { [key: string]: string } | null = null
  try {
    redirects = await kv.get<{ [key: string]: string }>('redirects')
  }
  catch (error) {
    if (import.meta.dev) {
      console.warn('Skipping KV redirects because the KV binding is unavailable.', error)
    }
    return
  }

  if (redirects?.[pathname]) {
    return sendRedirect(event, redirects[pathname])
  }
})
