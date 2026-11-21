// AI-assisted: see AI-ATTRIBUTION.md
import { describe, expect, it } from 'vitest'
import { roleToggles, withRole } from './roles'

describe('roleToggles', () => {
  it("disables only the Admin's own Admin toggle", () => {
    const me = { id: 'me', roles: ['admin' as const, 'player' as const] }
    expect(roleToggles(me, 'me', false)).toEqual({
      dm: { checked: false, disabled: false },
      admin: { checked: true, disabled: true },
    })
    expect(roleToggles(me, 'someone-else', false).admin.disabled).toBe(false)
  })
})

describe('withRole', () => {
  it('adds and removes a role without touching the others', () => {
    expect(withRole(['player'], 'dm', true)).toEqual(['player', 'dm'])
    expect(withRole(['admin', 'dm', 'player'], 'dm', false)).toEqual(['admin', 'player'])
    expect(withRole(['dm', 'player'], 'dm', true)).toEqual(['player', 'dm'])
  })
})
