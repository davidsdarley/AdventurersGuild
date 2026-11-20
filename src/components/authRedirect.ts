// AI-assisted: see AI-ATTRIBUTION.md

export const LOGIN_PATH = '/login'
export const DEFAULT_PATH = '/records'

// Router state passed to /login so it can send the user back afterwards.
export interface LoginState {
  from: string
}

export interface PathParts {
  pathname: string
  search: string
  hash: string
}

export type AuthDecision =
  | { kind: 'loading' }
  | { kind: 'allow' }
  | { kind: 'redirect'; to: string; state: LoginState }

// Decides what a protected route does for the current session and location.
export function decideProtectedRoute(
  session: { loading: boolean; user: unknown },
  location: PathParts,
): AuthDecision {
  if (session.loading) return { kind: 'loading' }
  if (session.user) return { kind: 'allow' }
  return {
    kind: 'redirect',
    to: LOGIN_PATH,
    state: { from: location.pathname + location.search + location.hash },
  }
}

// Where login should go on success: the saved path if it is a safe in-app path,
// otherwise Guild Records.
export function returnPathFrom(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) return DEFAULT_PATH
  const { from } = state
  if (typeof from !== 'string') return DEFAULT_PATH
  // Only same-origin absolute paths; "//host" and "/\host" would leave the site.
  if (!from.startsWith('/') || from.startsWith('//') || from.startsWith('/\\')) return DEFAULT_PATH
  if (from === LOGIN_PATH || from.startsWith(`${LOGIN_PATH}?`) || from.startsWith(`${LOGIN_PATH}#`)) {
    return DEFAULT_PATH
  }
  return from
}
