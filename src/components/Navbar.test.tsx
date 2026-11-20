// AI-assisted: see AI-ATTRIBUTION.md
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import type { Profile } from '../data/profiles'
import { Navbar } from './Navbar'

function render(profile: Profile): string {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Navbar profile={profile} onLogOut={() => {}} />
    </MemoryRouter>,
  )
}

describe('Navbar', () => {
  it('shows the Admin link to Admins', () => {
    const html = render({ username: 'gm', roles: ['player', 'admin'] })
    expect(html).toContain('href="/admin"')
  })

  it('hides the Admin link from Players and DMs', () => {
    expect(render({ username: 'p', roles: ['player'] })).not.toContain('href="/admin"')
    expect(render({ username: 'd', roles: ['player', 'dm'] })).not.toContain('href="/admin"')
  })

  it('shows the spec links and a Log out button', () => {
    const html = render({ username: 'aria', roles: ['player'] })
    for (const href of ['/players', '/characters', '/records', '/npcs', '/compendium', '/players/aria']) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).toContain('Guild Members')
    expect(html).toContain('Log out')
  })

  it('has a menu button for narrow screens, collapsed by default', () => {
    const html = render({ username: 'aria', roles: ['player'] })
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('>Menu<')
    expect(html).not.toContain('id="mobile-menu"')
  })
})
