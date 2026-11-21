// AI-assisted: see AI-ATTRIBUTION.md
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { MAX_CODES_PER_BATCH, generateInviteCodes, listInviteCodes, revokeInviteCode } from '../../data/admin'
import type { InviteCode } from '../../data/admin'
import { CodesList } from './CodesList'
import { errorMessage } from './format'
import { ErrorText, Panel, buttonClass, inputClass, secondaryButtonClass } from './ui'

export function InviteCodesSection() {
  const [codes, setCodes] = useState<InviteCode[] | null>(null)
  const [count, setCount] = useState('5')
  const [fresh, setFresh] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(
    () =>
      listInviteCodes().then(setCodes, (err: unknown) => {
        setError(errorMessage(err))
      }),
    [],
  )

  useEffect(() => {
    void reload()
  }, [reload])

  const generate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGenerating(true)
    setError(null)
    try {
      setFresh(await generateInviteCodes(Number(count)))
      await reload()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  const revoke = async (code: string) => {
    setRevoking(code)
    setError(null)
    try {
      await revokeInviteCode(code)
      setFresh((prev) => prev.filter((c) => c !== code))
      await reload()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setRevoking(null)
    }
  }

  return (
    <Panel title="Invite codes">
      <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => void generate(e)}>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Number of codes (1 to {MAX_CODES_PER_BATCH})</span>
          <input
            name="code-count"
            type="number"
            required
            min={1}
            max={MAX_CODES_PER_BATCH}
            step={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={`mt-1 block w-24 ${inputClass}`}
          />
        </label>
        <button type="submit" disabled={generating} className={buttonClass}>
          {generating ? 'Generating…' : 'Generate codes'}
        </button>
      </form>

      <ErrorText message={error} />

      {fresh.length > 0 && <NewCodes codes={fresh} />}

      <h3 className="font-semibold">All one-time codes</h3>
      {codes === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <CodesList codes={codes} revoking={revoking} onRevoke={(c) => void revoke(c)} />
      )}
    </Panel>
  )
}

// The codes just generated, each with a copy button.
function NewCodes({ codes }: { codes: string[] }) {
  return (
    <div className="rounded border border-green-200 bg-green-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">New codes</h3>
        <CopyButton text={codes.join('\n')} label="Copy all" />
      </div>
      <ul className="mt-2 space-y-1">
        {codes.map((c) => (
          <li key={c} className="flex items-center gap-3">
            <code className="font-mono">{c}</code>
            <CopyButton text={c} label="Copy" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copy = () => {
    navigator.clipboard.writeText(text).then(
      () => setState('copied'),
      () => setState('failed'),
    )
  }
  return (
    <button type="button" className={secondaryButtonClass} onClick={copy}>
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}
    </button>
  )
}
