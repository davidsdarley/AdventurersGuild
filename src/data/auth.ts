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
