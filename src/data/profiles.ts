// AI-assisted: see AI-ATTRIBUTION.md
import { supabase } from './supabase'

export const ROLES = ['admin', 'dm', 'player'] as const
export type Role = (typeof ROLES)[number]

export interface Profile {
  username: string
  roles: Role[]
}

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value)
}

// Returns null when no profile row exists for this user; throws on a query error.
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, roles')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return { username: data.username, roles: data.roles.filter(isRole) }
}
