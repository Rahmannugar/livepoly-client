const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
const realtimeBaseUrl = import.meta.env.VITE_REALTIME_BASE_URL?.replace(
  /\/$/,
  '',
)

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL')
}

if (!realtimeBaseUrl) {
  throw new Error('Missing VITE_REALTIME_BASE_URL')
}

export const env = {
  apiBaseUrl,
  realtimeBaseUrl,
} as const
