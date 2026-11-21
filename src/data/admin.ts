// AI-assisted: see AI-ATTRIBUTION.md
// Admin-only data: invite codes, the master code and player roles. RLS and
// the database functions enforce the Admin check; these calls only wrap them.
import { supabase } from './supabase'
import { ROLES } from './profiles'
import type { Role } from './profiles'

// Readable text for the errors the Admin database functions raise.
export const ADMIN_ERRORS: Record<string, string> = {
  admin_only: 'Only Admins can do this.',
  invalid_count: 'Choose between 1 and 20 codes.',
  code_not_found: 'That code no longer exists.',
  cannot_revoke_master: "The master code can't be revoked; change it instead.",
  code_already_used: "That code has already been used, so it can't be revoked.",
  invalid_master_code: 'The master code must be 8 to 64 characters, with no spaces at the start or end.',
  code_in_use: 'That value is already a one-time code. Choose another.',
  invalid_roles: "Those roles aren't valid.",
  cannot_remove_own_admin: "You can't remove your own Admin role.",
  user_not_found: 'That player no longer exists.',
}

export const UNKNOWN_ADMIN_ERROR = 'Something went wrong, please try again.'

export function adminErrorMessage(raw: string): string {
  return ADMIN_ERRORS[raw] ?? UNKNOWN_ADMIN_ERROR
}

function fail(error: { message: string }): never {
  throw new Error(adminErrorMessage(error.message))
}

// ---- Invite codes ----

export const MAX_CODES_PER_BATCH = 20

export type CodeStatus = 'unused' | 'used' | 'revoked'

export interface InviteCode {
  code: string
  status: CodeStatus
  // Username of the account that used the code; null if unused, or if that
  // account has since been deleted.
  usedBy: string | null
  usedAt: string | null
  createdAt: string
}

export function codeStatus(row: { revoked: boolean; used_at: string | null }): CodeStatus {
  if (row.used_at !== null) return 'used'
  if (row.revoked) return 'revoked'
  return 'unused'
}

// All one-time codes, newest first. The master code is read separately.
export async function listInviteCodes(): Promise<InviteCode[]> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('code, revoked, used_at, created_at, used_by_profile:profiles!invite_codes_used_by_fkey(username)')
    .eq('kind', 'one_time')
    .order('created_at', { ascending: false })
    .order('code')
  if (error) fail(error)
  return data.map((row) => ({
    code: row.code,
    status: codeStatus(row),
    usedBy: row.used_by_profile?.username ?? null,
    usedAt: row.used_at,
    createdAt: row.created_at,
  }))
}

// Generates `count` one-time codes (1 to MAX_CODES_PER_BATCH) and returns them.
export async function generateInviteCodes(count: number): Promise<string[]> {
  if (!Number.isInteger(count) || count < 1 || count > MAX_CODES_PER_BATCH) {
    throw new Error(ADMIN_ERRORS.invalid_count)
  }
  const { data, error } = await supabase.rpc('create_invite_codes', { count })
  if (error) fail(error)
  return data
}

export async function revokeInviteCode(code: string): Promise<void> {
  const { error } = await supabase.rpc('revoke_invite_code', { code })
  if (error) fail(error)
}

// ---- Master code ----

// Null when no master code has been set yet.
export async function getMasterCode(): Promise<string | null> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('code')
    .eq('kind', 'master')
    .maybeSingle()
  if (error) fail(error)
  return data?.code ?? null
}

export async function setMasterCode(newCode: string): Promise<void> {
  const { error } = await supabase.rpc('set_master_code', { new_code: newCode })
  if (error) fail(error)
}

// ---- Roles ----

export interface Player {
  id: string
  username: string
  roles: Role[]
}

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value)
}

export async function listPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from('profiles').select('id, username, roles').order('username')
  if (error) fail(error)
  return data.map((row) => ({ id: row.id, username: row.username, roles: row.roles.filter(isRole) }))
}

// Replaces a player's roles and returns the roles the database saved
// ('player' is always kept).
export async function setUserRoles(userId: string, roles: Role[]): Promise<Role[]> {
  const { data, error } = await supabase.rpc('set_user_roles', { user_id: userId, roles })
  if (error) fail(error)
  return data.filter(isRole)
}
