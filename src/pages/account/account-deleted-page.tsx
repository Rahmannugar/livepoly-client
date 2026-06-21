import { Link } from '@tanstack/react-router'

export function AccountDeletedPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <section className="w-full max-w-xl border-y border-[var(--line)] py-10 text-center">
        <p className="app-kicker">Account deleted</p>
        <h1 className="display-title mt-3 text-4xl font-semibold text-[var(--sea-ink)]">
          You have left the table.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base font-semibold leading-7 text-[var(--sea-ink-soft)]">
          Your sessions have been closed. If this was a mistake, contact a
          LivePoly administrator to restore the account, then sign in again.
        </p>
        <Link
          to="/auth/login"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-black text-[var(--primary-foreground)]"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  )
}
