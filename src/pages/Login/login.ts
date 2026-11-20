// AI-assisted: see AI-ATTRIBUTION.md
import { signIn } from '../../data/auth'
import { returnPathFrom } from '../../components/authRedirect'

export const LOGIN_ERROR = 'Incorrect email or password'

export type LoginOutcome = { ok: true; to: string } | { ok: false; error: string }

// Signs in and, on success, says where to go: the page the user was trying
// to open (from router state), else Guild Records. Every failure gives the
// same message, so it never reveals whether the email exists.
export async function logIn(email: string, password: string, routerState: unknown): Promise<LoginOutcome> {
  let ok = false
  try {
    ok = await signIn(email.trim(), password)
  } catch {
    ok = false
  }
  if (!ok) return { ok: false, error: LOGIN_ERROR }
  return { ok: true, to: returnPathFrom(routerState) }
}
