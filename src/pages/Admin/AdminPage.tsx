// AI-assisted: see AI-ATTRIBUTION.md
import { useSession } from '../../data/auth'
import { InviteCodesSection } from './InviteCodesSection'
import { MasterCodeSection } from './MasterCodeSection'
import { RolesSection } from './RolesSection'

// Hiding this page is a convenience; RLS and the Admin database functions also check the role.
export function AdminPage() {
  const { user, profile } = useSession()
  if (!user || !profile?.roles.includes('admin')) {
    return (
      <section className="p-8">
        <h1 className="text-2xl font-bold">Not allowed</h1>
        <p className="mt-2 text-gray-600">Only Admins can open this page.</p>
      </section>
    )
  }
  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <InviteCodesSection />
      <MasterCodeSection />
      <RolesSection ownId={user.id} />
    </section>
  )
}
