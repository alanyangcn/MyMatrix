import type { H3Event } from 'h3'
import { getRequestHeader, getRequestURL, send, setResponseHeaders, setResponseStatus } from 'h3'
import { defineNitroErrorHandler } from 'nitropack/runtime'

type ErrorLike = Error & {
  data?: unknown
  fatal?: boolean
  statusCode?: number
  statusMessage?: string
  statusText?: string
  unhandled?: boolean
}

type DefaultErrorHandler = (
  error: ErrorLike,
  event: H3Event,
  options?: { json?: boolean, silent?: boolean },
) => Promise<unknown> | unknown

const SERVER_ERROR_STATUS = 'Internal Server Error'

export default defineNitroErrorHandler(async (error: ErrorLike, event, { defaultHandler }: { defaultHandler: DefaultErrorHandler }) => {
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })

  if (!url.pathname.startsWith('/api/')) {
    return defaultHandler(error, event)
  }

  const requestId = getRequestHeader(event, 'x-request-id') || crypto.randomUUID()
  const statusCode = normalizeStatusCode(error.statusCode)
  const statusMessage = normalizeStatusMessage(error, statusCode)
  const body = {
    error: true,
    requestId,
    timestamp: new Date().toISOString(),
    method: event.method,
    url: url.href,
    path: url.pathname,
    statusCode,
    statusMessage,
    message: normalizeMessage(error, statusCode, statusMessage),
    errorName: error.name || 'Error',
    data: error.data,
    cause: normalizeCause(error.cause),
    stack: import.meta.dev ? error.stack?.split('\n').map(line => line.trim()) : undefined,
  }

  console.error(`[api error] [${requestId}] [${event.method}] ${url.pathname}`, {
    statusCode,
    statusMessage,
    message: body.message,
    cause: body.cause,
    error,
  })

  setResponseHeaders(event, {
    'content-type': 'application/json',
    'cache-control': 'no-cache',
    'x-content-type-options': 'nosniff',
    'x-request-id': requestId,
  })
  setResponseStatus(event, statusCode, statusMessage)

  return send(event, JSON.stringify(body, null, 2))
})

function normalizeStatusCode(statusCode: unknown) {
  return typeof statusCode === 'number' && statusCode >= 400 && statusCode <= 599 ? statusCode : 500
}

function normalizeStatusMessage(error: ErrorLike, statusCode: number) {
  if (error.statusMessage) return error.statusMessage
  if (error.statusText) return error.statusText
  return statusCode >= 500 ? SERVER_ERROR_STATUS : 'Request Error'
}

function normalizeMessage(error: ErrorLike, statusCode: number, statusMessage: string) {
  if (error.message && error.message !== 'Server Error') return error.message
  if (statusCode >= 500 && error.cause instanceof Error && error.cause.message) return error.cause.message
  return statusMessage
}

function normalizeCause(cause: unknown) {
  if (!cause) return undefined
  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
    }
  }
  if (typeof cause === 'object') return cause
  return String(cause)
}
