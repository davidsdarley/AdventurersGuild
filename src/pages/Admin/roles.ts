// AI-assisted: see AI-ATTRIBUTION.md
import type { Role } from '../../data/profiles'

// The roles an Admin can grant or remove here. 'player' is always kept.
export type ToggleRole = Extract<Role, 'dm' | 'admin'>

export interface RoleToggle {
  checked: boolean
  disabled: boolean
}

// State of one player's DM and Admin toggles. An Admin's own Admin toggle is
// disabled (the database also refuses that change).
export function roleToggles(
  player: { id: string; roles: Role[] },
  ownId: string,
  saving: boolean,
): Record<ToggleRole, RoleToggle> {
  const isSelf = player.id === ownId
  return {
    dm: { checked: player.roles.includes('dm'), disabled: saving },
    admin: { checked: player.roles.includes('admin'), disabled: saving || isSelf },
  }
}

// The player's roles with `role` turned on or off.
export function withRole(roles: Role[], role: ToggleRole, on: boolean): Role[] {
  const rest = roles.filter((r) => r !== role)
  return on ? [...rest, role] : rest
}
