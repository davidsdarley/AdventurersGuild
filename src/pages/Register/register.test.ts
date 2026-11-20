// AI-assisted: see AI-ATTRIBUTION.md
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkSignup, signUp } from '../../data/auth'
import { register } from './register'

vi.mock('../../data/auth', () => ({ checkSignup: vi.fn(), signUp: vi.fn() }))

const mockCheck = vi.mocked(checkSignup)
const mockSignUp = vi.mocked(signUp)

const form = {
  username: 'aria',
  email: 'aria@example.com',
  password: 'secret123',
  inviteCode: 'ABCDEFGHJKLM',
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('register', () => {
  it('shows "Invalid invite code" and does not sign up when the code is rejected', async () => {
    mockCheck.mockResolvedValue('invalid_code')
    expect(await register(form)).toEqual({ ok: false, error: 'Invalid invite code' })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows "Username already taken" and does not sign up when the name is in use', async () => {
    mockCheck.mockResolvedValue('username_taken')
    expect(await register(form)).toEqual({ ok: false, error: 'Username already taken' })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('signs up with the trimmed username and code after a passing check', async () => {
    mockCheck.mockResolvedValue('ok')
    mockSignUp.mockResolvedValue({ ok: true })
    const result = await register({ ...form, username: ' aria ', inviteCode: ' ABCDEFGHJKLM ' })
    expect(result).toEqual({ ok: true })
    expect(mockCheck).toHaveBeenCalledWith('aria', 'ABCDEFGHJKLM')
    expect(mockSignUp).toHaveBeenCalledWith(form)
  })

  it('shows "Sign-up failed, please try again" when sign-up fails after a passing check', async () => {
    mockCheck.mockResolvedValue('ok')
    mockSignUp.mockResolvedValue({ ok: false, reason: 'failed' })
    expect(await register(form)).toEqual({ ok: false, error: 'Sign-up failed, please try again' })
  })

  it('shows "Sign-up failed, please try again" when the check itself errors', async () => {
    mockCheck.mockRejectedValue(new Error('network'))
    expect(await register(form)).toEqual({ ok: false, error: 'Sign-up failed, please try again' })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('reports an email that already has an account', async () => {
    mockCheck.mockResolvedValue('ok')
    mockSignUp.mockResolvedValue({ ok: false, reason: 'email_taken' })
    expect(await register(form)).toEqual({
      ok: false,
      error: 'An account with this email already exists',
    })
  })

  it('rejects usernames outside 3 to 24 characters without calling the database', async () => {
    expect(await register({ ...form, username: 'ab' })).toEqual({
      ok: false,
      error: 'Username must be 3 to 24 characters',
    })
    expect(await register({ ...form, username: 'a'.repeat(25) })).toMatchObject({ ok: false })
    expect(mockCheck).not.toHaveBeenCalled()
  })

  it('rejects passwords under 6 characters without calling the database', async () => {
    expect(await register({ ...form, password: '12345' })).toEqual({
      ok: false,
      error: 'Password must be at least 6 characters',
    })
    expect(mockCheck).not.toHaveBeenCalled()
  })
})
