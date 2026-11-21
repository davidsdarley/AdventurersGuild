// AI-assisted: see AI-ATTRIBUTION.md
import type { ReactNode } from 'react'

// Shared pieces for the Admin page sections.

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  )
}

export const buttonClass =
  'rounded bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60'

export const secondaryButtonClass =
  'rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60'

export const inputClass =
  'rounded border border-gray-300 px-3 py-1.5 focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800'
