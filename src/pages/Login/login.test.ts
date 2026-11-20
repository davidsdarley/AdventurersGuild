// AI-assisted: see AI-ATTRIBUTION.md
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signIn } from '../../data/auth'
import { logIn } from './login'

vi.mock('../../data/auth', () => ({ signIn: vi.fn() }))

const mockSignIn = vi.mocked(signIn)

beforeEach(() => {
  vi.resetAllMocks()
})

describe('logIn', () => {
  it('goes to the page the user was trying to open', async () => {
    mockSignIn.mockResolvedValue(true)
    expect(await logIn('a@example.com', 'pw', { from: '/players/aria?tab=chars' })).toEqual({
      ok: true,
      to: '/players/aria?tab=chars',
    })
  })

  it('goes to Guild Records when there was no page', async () => {
    mockSignIn.mockResolvedValue(true)
    expect(await logIn('a@example.com', 'pw', null)).toEqual({ ok: true, to: '/records' })
  })

  it('ignores a saved path that would leave the site', async () => {
    mockSignIn.mockResolvedValue(true)
    expect(await logIn('a@example.com', 'pw', { from: '//evil.example' })).toEqual({
      ok: true,
      to: '/records',
    })
  })

  it('shows the same message for any failure', async () => {
    mockSignIn.mockResolvedValue(false)
    expect(await logIn('a@example.com', 'wrong', null)).toEqual({
      ok: false,
      error: 'Incorrect email or password',
    })
    mockSignIn.mockRejectedValue(new Error('network'))
    expect(await logIn('a@example.com', 'pw', null)).toEqual({
      ok: false,
      error: 'Incorrect email or password',
    })
  })

  it('trims the email but not the password', async () => {
    mockSignIn.mockResolvedValue(true)
    await logIn('  a@example.com ', ' pw ', null)
    expect(mockSignIn).toHaveBeenCalledWith('a@example.com', ' pw ')
  })
})
