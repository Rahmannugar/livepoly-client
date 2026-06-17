export function getRemainingMatchTimeMs(
  expiresAt: number | null | undefined,
  currentTimeMs: number,
) {
  if (!expiresAt) {
    return null
  }

  return Math.max(0, expiresAt - currentTimeMs)
}

export function formatRemainingMatchTime(remainingMs: number | null) {
  if (remainingMs === null) {
    return '...'
  }

  if (remainingMs <= 0) {
    return '0:00'
  }

  const totalSeconds = Math.ceil(remainingMs / 1_000)
  const hours = Math.floor(totalSeconds / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${padTimerValue(minutes)}:${padTimerValue(seconds)}`
  }

  return `${minutes}:${padTimerValue(seconds)}`
}

function padTimerValue(value: number) {
  return String(value).padStart(2, '0')
}
