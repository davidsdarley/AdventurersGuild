// AI-assisted: see AI-ATTRIBUTION.md
import { useState } from 'react'
import { NavLink as RouterNavLink } from 'react-router'
import type { Profile } from '../data/profiles'
import { isNavGroup, navItems } from './navLinks'
import type { NavLink } from './navLinks'

interface NavbarProps {
  profile: Profile
  onLogOut: () => void
}

function linkClass({ isActive }: { isActive: boolean }): string {
  return `block rounded px-3 py-2 text-sm hover:bg-gray-700 ${
    isActive ? 'bg-gray-900 font-semibold text-white' : 'text-gray-200'
  }`
}

function Links({ links, onNavigate }: { links: NavLink[]; onNavigate: () => void }) {
  return links.map((link) => (
    <li key={link.to}>
      <RouterNavLink to={link.to} end className={linkClass} onClick={onNavigate}>
        {link.label}
      </RouterNavLink>
    </li>
  ))
}

export function Navbar({ profile, onLogOut }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const items = navItems(profile)

  const list = (
    <ul className="flex flex-col gap-1 md:flex-row md:items-center">
      {items.map((item) =>
        isNavGroup(item) ? (
          <li key={item.label} className="md:flex md:items-center">
            <span className="block px-3 pt-2 text-xs uppercase tracking-wide text-gray-400 md:pt-0">
              {item.label}
            </span>
            <ul className="flex flex-col pl-3 md:flex-row md:pl-0">
              <Links links={item.links} onNavigate={close} />
            </ul>
          </li>
        ) : (
          <Links key={item.to} links={[item]} onNavigate={close} />
        ),
      )}
      <li>
        <button
          type="button"
          onClick={() => {
            close()
            onLogOut()
          }}
          className="block w-full rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
        >
          Log out
        </button>
      </li>
    </ul>
  )

  return (
    <nav className="bg-gray-800 text-white" aria-label="Main">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="font-bold">The Guild</span>
        <div className="hidden md:block">{list}</div>
        <button
          type="button"
          className="rounded px-3 py-2 text-sm hover:bg-gray-700 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="px-4 pb-3 md:hidden">
          {list}
        </div>
      )}
    </nav>
  )
}
