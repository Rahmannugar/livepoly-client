export type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
}

export type ApiErrorBody = {
  success?: boolean
  message?: string
  error?:
    | string
    | {
        code?: string
        statusCode?: number
        message?: string
        details?: unknown
      }
  code?: string
  statusCode?: number
  details?: unknown
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  authToken?: string | null
}

export type ApiClientInterceptor = (error: ApiClientError) => void

export type ApiClientError = Error & {
  statusCode: number
  code?: string
  details?: unknown
}
