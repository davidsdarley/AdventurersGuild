// AI-assisted: see AI-ATTRIBUTION.md
import type { Player } from '../../data/admin'
import { roleToggles } from './roles'
import type { ToggleRole } from './roles'

interface RolesListProps {
  players: Player[]
  // The signed-in Admin's user id; their own Admin toggle is disabled.
  ownId: string
  // The player whose roles are being saved right now, if any.
  savingId: string | null
  onToggle: (player: Player, role: ToggleRole, on: boolean) => void
}

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', dm: 'DM', player: 'Player' }

export function RolesList({ players, ownId, savingId, onToggle }: RolesListProps) {
  if (players.length === 0) return <p className="text-sm text-gray-600">No players yet.</p>
  return (
    <ul className="divide-y divide-gray-200 rounded border border-gray-200">
      {players.map((p) => {
        const toggles = roleToggles(p, ownId, savingId !== null)
        return (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <span>
              <span className="font-medium">{p.username}</span>
              {p.id === ownId && <span className="text-sm text-gray-500"> (you)</span>}
              <span className="block text-sm text-gray-600">
                {p.roles.map((r) => ROLE_LABELS[r]).join(', ')}
              </span>
            </span>
            <span className="flex items-center gap-4 text-sm">
              {(['dm', 'admin'] as const).map((role) => (
                <label key={role} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    role="switch"
                    name={`${role}-${p.id}`}
                    checked={toggles[role].checked}
                    disabled={toggles[role].disabled}
                    onChange={(e) => onToggle(p, role, e.target.checked)}
                    className="h-4 w-4 accent-gray-800 disabled:opacity-50"
                  />
                  {ROLE_LABELS[role]}
                </label>
              ))}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
