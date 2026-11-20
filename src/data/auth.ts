// AI-assisted: see AI-ATTRIBUTION.md
import { createContext, createElement, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { getProfile } from './profiles'
import type { Profile } from './profiles'

export interface Session {
  user: User | null
  // Null while loading, when signed out, or when the profile could not be loaded.
  profile: Profile | null
  // True until the auth state is known and, if signed in, the profile fetch has finished.
  loading: boolean
  // Set when a signed-in user's profile is missing or failed to load.
  profileError: string | null
}

const signedOut: Session = { user: null, profile: null, loading: false, profileError: null }

export const SessionContext = createContext<Session | null>(null)

type ProfileState =
  | { userId: string; profile: Profile; error: null }
  | { userId: string; profile: null; error: string }

export function SessionProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profileState, setProfileState] = useState<ProfileState | null>(null)

  useEffect(() => {
    // INITIAL_SESSION fires first, so this also covers the session restored on reload.
    // Supabase advises against awaiting other Supabase calls inside this callback,
    // so the profile is fetched in a separate effect keyed on the user id.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null
      setUser((prev) => (prev?.id === next?.id ? (next ?? prev) : next))
      setAuthReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getProfile(userId)
      .then((profile) => {
        if (cancelled) return
        setProfileState(
          profile
            ? { userId, profile, error: null }
            : { userId, profile: null, error: 'No profile exists for this account.' },
        )
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setProfileState({ userId, profile: null, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  let value: Session
  if (!authReady) {
    value = { ...signedOut, loading: true }
  } else if (!user) {
    value = signedOut
  } else if (profileState?.userId !== user.id) {
    value = { user, profile: null, loading: true, profileError: null }
  } else {
    value = { user, profile: profileState.profile, loading: false, profileError: profileState.error }
  }

  return createElement(SessionContext.Provider, { value }, children)
}

export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used inside <SessionProvider>')
  return session
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

// Result of the Register form's pre-check (the check_signup database function).
export type SignupCheck = 'ok' | 'invalid_code' | 'username_taken'

// Checks the invite code, then the username. Reserves nothing: the auth.users
// trigger makes the final decision when the account is created.
export async function checkSignup(username: string, code: string): Promise<SignupCheck> {
  const { data, error } = await supabase.rpc('check_signup', { username, code })
  if (error) throw new Error(error.message)
  if (data === 'ok' || data === 'invalid_code' || data === 'username_taken') return data
  throw new Error(`Unexpected check_signup result: ${String(data)}`)
}

export interface SignUpInput {
  username: string
  email: string
  password: string
  inviteCode: string
}

export type SignUpResult =
  | { ok: true }
  | { ok: false; reason: 'email_taken' | 'weak_password' | 'failed' }

// Creates the account. The trigger on auth.users reads username and
// invite_code from the user metadata; if it rejects them, Supabase reports a
// generic database error, which comes back here as 'failed'.
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { username: input.username, invite_code: input.inviteCode } },
  })
  if (!error) return { ok: true }
  if (error.code === 'user_already_exists' || error.code === 'email_exists') {
    return { ok: false, reason: 'email_taken' }
  }
  if (error.code === 'weak_password') return { ok: false, reason: 'weak_password' }
  return { ok: false, reason: 'failed' }
}

// Returns false on any failure, so callers cannot tell a wrong email from a
// wrong password.
export async function signIn(email: string, password: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return !error
}

export const RESET_PASSWORD_PATH = '/reset-password'

// Sends a Supabase password reset email whose link opens /reset-password.
// The redirect URL must be in the Auth allow-list (additional_redirect_urls).
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${RESET_PASSWORD_PATH}`,
  })
  if (error) throw new Error(error.message)
}

// Sets a new password for the signed-in user (the reset link signs them in).
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}
