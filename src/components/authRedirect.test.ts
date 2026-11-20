// AI-assisted: see AI-ATTRIBUTION.md
import { describe, expect, it } from 'vitest'
import { decideProtectedRoute, returnPathFrom } from './authRedirect'

const at = (pathname: string, search = '', hash = '') => ({ pathname, search, hash })

describe('decideProtectedRoute', () => {
  it('waits while the session is loading', () => {
    expect(decideProtectedRoute({ loading: true, user: null }, at('/records'))).toEqual({
      kind: 'loading',
    })
  })

  it('sends a signed-out visitor to /login and keeps the original path', () => {
    expect(decideProtectedRoute({ loading: false, user: null }, at('/records'))).toEqual({
      kind: 'redirect',
      to: '/login',
      state: { from: '/records' },
    })
  })

  it('keeps the query string and hash of the original path', () => {
    const decision = decideProtectedRoute(
      { loading: false, user: null },
      at('/players/aria', '?tab=chars', '#top'),
    )
    expect(decision).toMatchObject({ state: { from: '/players/aria?tab=chars#top' } })
  })

  it('lets a signed-in user through', () => {
    expect(decideProtectedRoute({ loading: false, user: { id: 'u1' } }, at('/records'))).toEqual({
      kind: 'allow',
    })
  })
})

describe('returnPathFrom', () => {
  it('returns the saved path', () => {
    expect(returnPathFrom({ from: '/npcs?x=1' })).toBe('/npcs?x=1')
  })

  it('defaults to Guild Records when nothing was saved', () => {
    expect(returnPathFrom(null)).toBe('/records')
    expect(returnPathFrom(undefined)).toBe('/records')
    expect(returnPathFrom({})).toBe('/records')
    expect(returnPathFrom({ from: 42 })).toBe('/records')
  })

  it('rejects paths that would leave the site or loop back to login', () => {
    expect(returnPathFrom({ from: 'https://evil.example' })).toBe('/records')
    expect(returnPathFrom({ from: '//evil.example' })).toBe('/records')
    expect(returnPathFrom({ from: '/\\evil.example' })).toBe('/records')
    expect(returnPathFrom({ from: '/login' })).toBe('/records')
    expect(returnPathFrom({ from: '/login?x=1' })).toBe('/records')
  })
})
