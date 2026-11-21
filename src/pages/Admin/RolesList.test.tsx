// AI-assisted: see AI-ATTRIBUTION.md
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Player } from '../../data/admin'
import { RolesList } from './RolesList'

vi.mock('../../data/supabase', () => ({ supabase: {} }))

const me: Player = { id: 'me', username: 'gm', roles: ['admin', 'player'] }
const otherAdmin: Player = { id: 'a2', username: 'cora', roles: ['admin', 'dm', 'player'] }
const player: Player = { id: 'p1', username: 'aria', roles: ['player'] }

function render(players: Player[], savingId: string | null = null): string {
  return renderToStaticMarkup(<RolesList players={players} ownId="me" savingId={savingId} onToggle={() => {}} />)
}

// The <input> tag for one toggle, found by its name.
function toggle(html: string, role: 'dm' | 'admin', id: string): string {
  const match = html.match(new RegExp(`<input[^>]*name="${role}-${id}"[^>]*>`))
  if (!match) throw new Error(`No ${role} toggle for ${id}`)
  return match[0]
}

describe('RolesList', () => {
  it("disables the signed-in Admin's own Admin toggle", () => {
    const html = render([me, otherAdmin, player])
    const own = toggle(html, 'admin', 'me')
    expect(own).toContain('disabled=""')
    expect(own).toContain('checked=""')
  })

  it("keeps the signed-in Admin's own DM toggle enabled", () => {
    expect(toggle(render([me]), 'dm', 'me')).not.toContain('disabled=""')
  })

  it("keeps other players' Admin and DM toggles enabled", () => {
    const html = render([me, otherAdmin, player])
    for (const id of ['a2', 'p1']) {
      expect(toggle(html, 'admin', id)).not.toContain('disabled=""')
      expect(toggle(html, 'dm', id)).not.toContain('disabled=""')
    }
  })

  it('shows each player with their current roles checked', () => {
    const html = render([otherAdmin, player])
    expect(html).toContain('Admin, DM, Player')
    expect(toggle(html, 'dm', 'a2')).toContain('checked=""')
    expect(toggle(html, 'admin', 'p1')).not.toContain('checked=""')
    expect(toggle(html, 'dm', 'p1')).not.toContain('checked=""')
  })

  it('disables every toggle while a change is saving', () => {
    const html = render([me, player], 'p1')
    expect(toggle(html, 'dm', 'p1')).toContain('disabled=""')
    expect(toggle(html, 'admin', 'p1')).toContain('disabled=""')
    expect(toggle(html, 'dm', 'me')).toContain('disabled=""')
  })
})
