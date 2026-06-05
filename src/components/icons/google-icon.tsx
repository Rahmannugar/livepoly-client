import type { SVGProps } from 'react'

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 3-4.33 3-7.52Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.24-2.51c-.9.6-2.05.96-3.4.96a6 6 0 0 1-5.64-4.14H3.02v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.36 13.88a6 6 0 0 1 0-3.76v-2.6H3.02a10 10 0 0 0 0 8.96l3.34-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.8.5 3.84 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2 10 10 0 0 0 3.02 7.52l3.34 2.6A6 6 0 0 1 12 5.98Z"
      />
    </svg>
  )
}
