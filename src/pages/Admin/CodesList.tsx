// AI-assisted: see AI-ATTRIBUTION.md
import type { InviteCode } from '../../data/admin'
import { formatDate } from './format'
import { secondaryButtonClass } from './ui'

interface CodesListProps {
  codes: InviteCode[]
  // The code being revoked right now, if any.
  revoking: string | null
  onRevoke: (code: string) => void
}

// Every one-time code with its state. Only unused codes can be revoked.
export function CodesList({ codes, revoking, onRevoke }: CodesListProps) {
  if (codes.length === 0) return <p className="text-sm text-gray-600">No one-time codes yet.</p>
  return (
    <ul className="divide-y divide-gray-200 rounded border border-gray-200">
      {codes.map((c) => (
        <li key={c.code} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <code className={c.status === 'unused' ? 'font-mono' : 'font-mono text-gray-500'}>{c.code}</code>
          <span className="flex items-center gap-3 text-sm">
            <CodeState code={c} />
            {c.status === 'unused' && (
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={revoking !== null}
                onClick={() => onRevoke(c.code)}
              >
                {revoking === c.code ? 'Revoking…' : 'Revoke'}
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

function CodeState({ code }: { code: InviteCode }) {
  if (code.status === 'unused') return <span className="text-green-700">Unused</span>
  if (code.status === 'revoked') return <span className="text-red-700">Revoked</span>
  const who = code.usedBy ?? 'a deleted account'
  const when = code.usedAt ? ` on ${formatDate(code.usedAt)}` : ''
  return (
    <span className="text-gray-600">
      Used by {who}
      {when}
    </span>
  )
}
