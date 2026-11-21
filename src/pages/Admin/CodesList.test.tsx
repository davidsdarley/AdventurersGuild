// AI-assisted: see AI-ATTRIBUTION.md
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { InviteCode } from '../../data/admin'
import { CodesList } from './CodesList'

vi.mock('../../data/supabase', () => ({ supabase: {} }))

const unused: InviteCode = {
  code: 'UNUSEDCODE22',
  status: 'unused',
  usedBy: null,
  usedAt: null,
  createdAt: '2026-11-20T10:00:00Z',
}
const used: InviteCode = {
  code: 'USEDCODE3333',
  status: 'used',
  usedBy: 'aria',
  usedAt: '2026-11-20T12:00:00Z',
  createdAt: '2026-11-20T10:00:00Z',
}
const revoked: InviteCode = {
  code: 'REVOKEDCODE4',
  status: 'revoked',
  usedBy: null,
  usedAt: null,
  createdAt: '2026-11-20T10:00:00Z',
}

function render(codes: InviteCode[], revoking: string | null = null): string {
  return renderToStaticMarkup(<CodesList codes={codes} revoking={revoking} onRevoke={() => {}} />)
}

// The list item holding `code`.
function itemFor(html: string, code: string): string {
  const item = html.split('<li').find((part) => part.includes(code))
  if (!item) throw new Error(`No item for ${code}`)
  return item
}

describe('CodesList', () => {
  it('shows an unused code as Unused with a Revoke button', () => {
    const item = itemFor(render([unused]), unused.code)
    expect(item).toContain('Unused')
    expect(item).toContain('>Revoke<')
  })

  it('shows a used code with who used it and when, and no Revoke button', () => {
    const item = itemFor(render([used]), used.code)
    expect(item).toContain('Used by aria')
    expect(item).toContain(new Date(used.usedAt as string).toLocaleString())
    expect(item).not.toContain('Revoke')
  })

  it('shows a used code whose account was deleted', () => {
    const item = itemFor(render([{ ...used, usedBy: null }]), used.code)
    expect(item).toContain('Used by a deleted account')
  })

  it('shows a revoked code as Revoked with no Revoke button', () => {
    const item = itemFor(render([revoked]), revoked.code)
    expect(item).toContain('Revoked')
    expect(item).not.toContain('>Revoke<')
  })

  it('shows each code in its own state when mixed', () => {
    const html = render([unused, used, revoked])
    expect(itemFor(html, unused.code)).toContain('Unused')
    expect(itemFor(html, used.code)).toContain('Used by aria')
    expect(itemFor(html, revoked.code)).toContain('Revoked')
    expect(html.match(/>Revoke</g)).toHaveLength(1)
  })

  it('disables Revoke buttons while a revoke is in progress', () => {
    const other = { ...unused, code: 'OTHERCODE567' }
    const html = render([unused, other], unused.code)
    expect(itemFor(html, unused.code)).toContain('Revoking…')
    expect(itemFor(html, other.code)).toContain('disabled=""')
  })

  it('says when there are no codes', () => {
    expect(render([])).toContain('No one-time codes yet.')
  })
})
