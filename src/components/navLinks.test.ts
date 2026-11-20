// AI-assisted: see AI-ATTRIBUTION.md
import { describe, expect, it } from 'vitest'
import { isNavGroup, navItems } from './navLinks'
import type { NavItem } from './navLinks'

const hrefs = (items: NavItem[]) => items.flatMap((i) => (isNavGroup(i) ? i.links : [i])).map((l) => l.to)

describe('navItems', () => {
  it('includes Admin only for Admins', () => {
    expect(hrefs(navItems({ username: 'a', roles: ['admin'] }))).toContain('/admin')
    expect(hrefs(navItems({ username: 'p', roles: ['player', 'dm'] }))).not.toContain('/admin')
  })

  it('links My Profile to the user, URL-encoded', () => {
    expect(hrefs(navItems({ username: 'a b', roles: ['player'] }))).toContain('/players/a%20b')
  })
})
