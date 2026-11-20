// AI-assisted: see AI-ATTRIBUTION.md
import { ComingSoon } from '../../components/ComingSoon'
import { useSession } from '../../data/auth'

// Hiding this page is a convenience; the Admin database functions also check the role.
export function AdminPage() {
  const { profile } = useSession()
  if (!profile?.roles.includes('admin')) {
    return (
      <section className="p-8">
        <h1 className="text-2xl font-bold">Not allowed</h1>
        <p className="mt-2 text-gray-600">Only Admins can open this page.</p>
      </section>
    )
  }
  return <ComingSoon page="Admin" />
}
