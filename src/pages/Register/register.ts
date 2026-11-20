// AI-assisted: see AI-ATTRIBUTION.md
import { checkSignup, signUp } from '../../data/auth'
import type { SignUpInput } from '../../data/auth'

export const REGISTER_ERRORS = {
  invalidCode: 'Invalid invite code',
  usernameTaken: 'Username already taken',
  usernameLength: 'Username must be 3 to 24 characters',
  emailTaken: 'An account with this email already exists',
  weakPassword: 'Password must be at least 6 characters',
  failed: 'Sign-up failed, please try again',
} as const

export const MIN_PASSWORD_LENGTH = 6

export type RegisterOutcome = { ok: true } | { ok: false; error: string }

// Runs the Register form: local checks, then check_signup for a readable
// error, then the actual sign-up (which the database checks again).
export async function register(form: SignUpInput): Promise<RegisterOutcome> {
  const input: SignUpInput = {
    username: form.username.trim(),
    email: form.email.trim(),
    password: form.password,
    inviteCode: form.inviteCode.trim(),
  }

  // Matches the length check in the auth.users trigger, which check_signup does not do.
  if (input.username.length < 3 || input.username.length > 24) {
    return { ok: false, error: REGISTER_ERRORS.usernameLength }
  }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: REGISTER_ERRORS.weakPassword }
  }

  let check
  try {
    check = await checkSignup(input.username, input.inviteCode)
  } catch {
    return { ok: false, error: REGISTER_ERRORS.failed }
  }
  if (check === 'invalid_code') return { ok: false, error: REGISTER_ERRORS.invalidCode }
  if (check === 'username_taken') return { ok: false, error: REGISTER_ERRORS.usernameTaken }

  let result
  try {
    result = await signUp(input)
  } catch {
    return { ok: false, error: REGISTER_ERRORS.failed }
  }
  if (result.ok) return { ok: true }
  if (result.reason === 'email_taken') return { ok: false, error: REGISTER_ERRORS.emailTaken }
  if (result.reason === 'weak_password') return { ok: false, error: REGISTER_ERRORS.weakPassword }
  return { ok: false, error: REGISTER_ERRORS.failed }
}
