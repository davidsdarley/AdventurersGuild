// AI-assisted: see AI-ATTRIBUTION.md
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { User } from '@supabase/supabase-js'
import { SessionContext } from '../../data/auth'
import type { Role } from '../../data/profiles'
import { AdminPage } from './AdminPage'

vi.mock('../../data/supabase', () => ({ supabase: {} }))

function render(roles: Role[]): string {
  const session = {
    user: { id: 'u1' } as User,
    profile: { username: 'x', roles },
    loading: false,
    profileError: null,
  }
  return renderToStaticMarkup(
    <SessionContext.Provider value={session}>
      <AdminPage />
    </SessionContext.Provider>,
  )
}

describe('AdminPage', () => {
  it('shows Not allowed to non-Admins', () => {
    expect(render(['player', 'dm'])).toContain('Not allowed')
  })

  it('shows the page to Admins', () => {
    const html = render(['player', 'admin'])
    expect(html).not.toContain('Not allowed')
    expect(html).toContain('Admin')
  })
})
