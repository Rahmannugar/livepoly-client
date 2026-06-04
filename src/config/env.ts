const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL')
}

export const env = {
  apiBaseUrl,
} as const
