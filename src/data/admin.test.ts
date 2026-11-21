// AI-assisted: see AI-ATTRIBUTION.md
import { describe, expect, it, vi } from 'vitest'
import { adminErrorMessage, codeStatus, generateInviteCodes } from './admin'

vi.mock('./supabase', () => ({ supabase: {} }))

describe('codeStatus', () => {
  it('is unused when neither used nor revoked', () => {
    expect(codeStatus({ revoked: false, used_at: null })).toBe('unused')
  })
  it('is used once used_at is set', () => {
    expect(codeStatus({ revoked: false, used_at: '2026-11-20T12:00:00Z' })).toBe('used')
  })
  it('is revoked when revoked and unused', () => {
    expect(codeStatus({ revoked: true, used_at: null })).toBe('revoked')
  })
})

describe('adminErrorMessage', () => {
  it('maps database error codes to readable text', () => {
    expect(adminErrorMessage('cannot_remove_own_admin')).toBe("You can't remove your own Admin role.")
  })
  it('falls back to a generic message', () => {
    expect(adminErrorMessage('connection reset')).toBe('Something went wrong, please try again.')
  })
})

describe('generateInviteCodes', () => {
  it('rejects counts outside 1 to 20 without calling the database', async () => {
    for (const n of [0, 21, 1.5]) {
      await expect(generateInviteCodes(n)).rejects.toThrow('Choose between 1 and 20 codes.')
    }
  })
})
