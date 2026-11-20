// AI-assisted: see AI-ATTRIBUTION.md
import type { FormEvent, ReactNode } from 'react'

// Shared layout for the signed-out pages: Login, Register, Forgot password, Reset password.
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <section className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <p className="text-sm font-bold uppercase tracking-wide text-gray-500">The Guild</p>
        <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        <div className="mt-4">{children}</div>
      </section>
    </main>
  )
}

interface FieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password'
  autoComplete: string
  value: string
  onChange: (value: string) => void
  minLength?: number
  maxLength?: number
}

export function Field({ label, name, type = 'text', autoComplete, value, onChange, minLength, maxLength }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800"
      />
    </label>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  )
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full rounded bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-60"
    >
      {busy ? 'Please wait…' : children}
    </button>
  )
}

// A form that runs `onSubmit` instead of the browser's own form submission.
export function Form({ onSubmit, children }: { onSubmit: () => void; children: ReactNode }) {
  const handle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit()
  }
  return (
    <form className="space-y-4" onSubmit={handle}>
      {children}
    </form>
  )
}
