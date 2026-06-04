import { env } from '#/config/env'
import type {
  ApiClientError,
  ApiClientInterceptor,
  ApiEnvelope,
  ApiErrorBody,
  ApiRequestOptions,
} from './client.types'

let unauthorizedInterceptor: ApiClientInterceptor | null = null
let forbiddenInterceptor: ApiClientInterceptor | null = null

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
  return Object.assign(new Error(message), {
    name: 'ApiClientError',
    statusCode,
    code: error.code,
    details: error.details,
  })
}

function buildHeaders(options: ApiRequestOptions): Headers {
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.authToken) {
    headers.set('Authorization', `Bearer ${options.authToken}`)
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

  return fallback
}

function runStatusInterceptor(error: ApiClientError) {
  if (error.statusCode === 401) {
    unauthorizedInterceptor?.(error)
    return
  }

  if (error.statusCode === 403) {
    forbiddenInterceptor?.(error)
  }
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: buildHeaders(options),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const body = await parseResponseBody(response)

  if (!response.ok) {
    const errorBody =
      typeof body === 'object' && body !== null ? (body as ApiErrorBody) : {}

    const error = createApiClientError(
      getErrorMessage(body, `Request failed with status ${response.status}`),
      errorBody,
      response.status,
    )

    runStatusInterceptor(error)

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
