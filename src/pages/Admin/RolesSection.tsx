// AI-assisted: see AI-ATTRIBUTION.md
import { useEffect, useState } from 'react'
import { listPlayers, setUserRoles } from '../../data/admin'
import type { Player } from '../../data/admin'
import { withRole } from './roles'
import type { ToggleRole } from './roles'
import { RolesList } from './RolesList'
import { errorMessage } from './format'
import { ErrorText, Panel } from './ui'

export function RolesSection({ ownId }: { ownId: string }) {
  const [players, setPlayers] = useState<Player[] | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listPlayers().then(
      (list) => {
        if (!cancelled) setPlayers(list)
      },
      (err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = async (player: Player, role: ToggleRole, on: boolean) => {
    setSavingId(player.id)
    setError(null)
    try {
      const roles = await setUserRoles(player.id, withRole(player.roles, role, on))
      setPlayers((prev) => prev?.map((p) => (p.id === player.id ? { ...p, roles } : p)) ?? prev)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Panel title="Roles">
      <p className="text-sm text-gray-600">Every player has the Player role. You can't remove your own Admin role.</p>
      <ErrorText message={error} />
      {players === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <RolesList
          players={players}
          ownId={ownId}
          savingId={savingId}
          onToggle={(p, role, on) => void toggle(p, role, on)}
        />
      )}
    </Panel>
  )
}
