// AI-assisted: see AI-ATTRIBUTION.md
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { getMasterCode, setMasterCode } from '../../data/admin'
import { errorMessage } from './format'
import { ErrorText, Panel, buttonClass, inputClass } from './ui'

export function MasterCodeSection() {
  // undefined while loading; null when no master code exists.
  const [current, setCurrent] = useState<string | null | undefined>(undefined)
  const [next, setNext] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMasterCode().then(
      (code) => {
        if (!cancelled) setCurrent(code)
      },
      (err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      // Sent as typed: the database rejects leading or trailing spaces
      // rather than silently changing the value.
      await setMasterCode(next)
      setCurrent(next)
      setNext('')
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel title="Master code">
      <p>
        <span className="text-sm text-gray-600">Current: </span>
        {current === undefined ? (
          <span className="text-sm text-gray-500">Loading…</span>
        ) : current === null ? (
          <span className="text-sm text-gray-500">No master code set</span>
        ) : (
          <code className="font-mono">{current}</code>
        )}
      </p>
      <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => void save(e)}>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">New master code (8 to 64 characters)</span>
          <input
            name="master-code"
            autoComplete="off"
            required
            minLength={8}
            maxLength={64}
            value={next}
            onChange={(e) => {
              setNext(e.target.value)
              setSaved(false)
            }}
            className={`mt-1 block w-72 max-w-full ${inputClass}`}
          />
        </label>
        <button type="submit" disabled={saving} className={buttonClass}>
          {saving ? 'Saving…' : 'Change master code'}
        </button>
      </form>
      <ErrorText message={error} />
      {saved && (
        <p role="status" className="text-sm text-green-700">
          Master code changed. The old value no longer works.
        </p>
      )}
    </Panel>
  )
}
