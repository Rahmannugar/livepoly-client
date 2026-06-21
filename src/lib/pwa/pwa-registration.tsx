import { useEffect } from 'react'

export function PwaRegistration() {
  useEffect(() => {
    void import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({ immediate: true })
    })
  }, [])

  return null
}
