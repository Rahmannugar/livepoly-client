const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
const configuredRealtimeBaseUrl = import.meta.env.VITE_REALTIME_BASE_URL?.replace(
  /\/$/,
  '',
)

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL')
}

function getRealtimeBaseUrl() {
  if (configuredRealtimeBaseUrl) {
    return configuredRealtimeBaseUrl
  }

  const url = new URL(apiBaseUrl)

  if (url.pathname === '/api') {
    url.pathname = ''
  }

  return url.toString().replace(/\/$/, '')
}

export const env = {
  apiBaseUrl,
  realtimeBaseUrl: getRealtimeBaseUrl(),
} as const
