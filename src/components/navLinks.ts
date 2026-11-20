// AI-assisted: see AI-ATTRIBUTION.md
import type { Profile } from '../data/profiles'

export interface NavLink {
  label: string
  to: string
}

export interface NavGroup {
  label: string
  links: NavLink[]
}

export type NavItem = NavLink | NavGroup

export function isNavGroup(item: NavItem): item is NavGroup {
  return 'links' in item
}

// Navbar entries per the spec. The Admin link is a convenience only; the
// database enforces Admin permissions.
export function navItems(profile: Profile): NavItem[] {
  const items: NavItem[] = [
    {
      label: 'Guild Members',
      links: [
        { label: 'Players', to: '/players' },
        { label: 'Characters', to: '/characters' },
      ],
    },
    { label: 'Guild Records', to: '/records' },
    { label: 'NPCs', to: '/npcs' },
    { label: 'Compendium', to: '/compendium' },
    { label: 'My Profile', to: `/players/${encodeURIComponent(profile.username)}` },
  ]
  if (profile.roles.includes('admin')) items.push({ label: 'Admin', to: '/admin' })
  return items
}
