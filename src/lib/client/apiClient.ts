import { env } from '#/config/env'
import type {
  ApiClientError,
  ApiClientInterceptor,
  ApiEnvelope,
  ApiErrorBody,
  ApiRequestOptions,
} from './client.types'

const API_CLIENT_REQUEST_TIMEOUT_MS = 60_000

let unauthorizedInterceptor: ApiClientInterceptor | null = null
let forbiddenInterceptor: ApiClientInterceptor | null = null
let accessToken: string | null = null

export function getClientAccessToken() {
  return accessToken
}

export function setClientAccessToken(token: string | null) {
  accessToken = token
}

export function clearClientAccessToken() {
  accessToken = null
}

export function setUnauthorizedInterceptor(
  interceptor: ApiClientInterceptor | null,
) {
  unauthorizedInterceptor = interceptor
}

export function setForbiddenInterceptor(
  interceptor: ApiClientInterceptor | null,
) {
  forbiddenInterceptor = interceptor
}

function createApiClientError(
  message: string,
  error: ApiErrorBody,
  statusCode: number,
): ApiClientError {
  const nestedError =
    typeof error.error === 'object' && error.error !== null
      ? error.error
      : null

  return Object.assign(new Error(message), {
    name: 'ApiClientError',
    statusCode,
    code: nestedError?.code ?? error.code,
    details: nestedError?.details ?? error.details,
  })
}

function createRequestTimeoutError(): ApiClientError {
  return Object.assign(new Error('Request timed out. Try again.'), {
    name: 'ApiClientError',
    statusCode: 408,
    code: 'REQUEST_TIMEOUT',
    details: undefined,
  })
}

function buildHeaders(options: ApiRequestOptions): Headers {
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = options.authToken ?? getClientAccessToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as ApiErrorBody).message

    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  if (typeof body === 'object' && body !== null && 'error' in body) {
    const error = (body as ApiErrorBody).error

    if (typeof error === 'string' && error.trim()) {
      return error
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      typeof error.message === 'string' &&
      error.message.trim()
    ) {
      return error.message
    }
  }

  return fallback
}

function isAuthEndpoint(path: string) {
  return path.startsWith('/auth/')
}

async function runStatusInterceptor(error: ApiClientError, path: string) {
  if (error.statusCode === 401 && !isAuthEndpoint(path)) {
    return unauthorizedInterceptor?.(error)
  }

  if (error.statusCode === 403) {
    return forbiddenInterceptor?.(error)
  }

  return false
}

async function requestApi<T>(
  path: string,
  options: ApiRequestOptions = {},
  canRecoverAuth = true,
): Promise<T> {
  const abortController = new AbortController()
  const timeoutId = window.setTimeout(() => {
    abortController.abort()
  }, API_CLIENT_REQUEST_TIMEOUT_MS)
  const abortRequest = () => abortController.abort()

  if (options.signal) {
    if (options.signal.aborted) {
      abortController.abort()
    } else {
      options.signal.addEventListener('abort', abortRequest, { once: true })
    }
  }

  let response: Response

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(options),
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: abortController.signal,
    })
  } catch (error) {
    if (abortController.signal.aborted && !options.signal?.aborted) {
      throw createRequestTimeoutError()
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
    options.signal?.removeEventListener('abort', abortRequest)
  }

  const body = await parseResponseBody(response)

  if (!response.ok) {
    const errorBody =
      typeof body === 'object' && body !== null ? (body as ApiErrorBody) : {}

    const error = createApiClientError(
      getErrorMessage(body, `Request failed with status ${response.status}`),
      errorBody,
      response.status,
    )

    const recovered = await runStatusInterceptor(error, path)

    if (canRecoverAuth && error.statusCode === 401 && recovered === true) {
      return requestApi<T>(path, options, false)
    }

    throw error
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    'data' in body
  ) {
    return (body as ApiEnvelope<T>).data
  }

  return body as T
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return requestApi<T>(path, options)
}
