export function RouteTransitionOverlay({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[color-mix(in_oklab,var(--bg-base)_88%,transparent)] px-5 backdrop-blur-xl">
      <div className="grid justify-items-center gap-3 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--primary)]" />
        <p className="display-title text-3xl font-semibold text-[var(--sea-ink)]">
          {label}
        </p>
      </div>
    </div>
  )
}
