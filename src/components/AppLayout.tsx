// AI-assisted: see AI-ATTRIBUTION.md
import { Outlet, useNavigate } from 'react-router'
import { signOut, useSession } from '../data/auth'
import { LOGIN_PATH } from './authRedirect'
import { Navbar } from './Navbar'

// Layout for every signed-in page. Rendered inside <RequireAuth>, so a user is present.
export function AppLayout() {
  const { profile, profileError } = useSession()
  const navigate = useNavigate()

  const logOut = () => {
    signOut()
      .catch((err: unknown) => console.error('Log out failed', err))
      .finally(() => navigate(LOGIN_PATH, { replace: true }))
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-bold">Your account profile couldn't be loaded</h1>
        <p className="mt-2 text-gray-600">
          You are signed in, but the guild has no profile for this account. Please tell an Admin.
        </p>
        {profileError && <p className="mt-2 text-sm text-gray-500">Details: {profileError}</p>}
        <button
          type="button"
          onClick={logOut}
          className="mt-4 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          Log out
        </button>
      </main>
    )
  }

  return (
    <>
      <Navbar profile={profile} onLogOut={logOut} />
      <main>
        <Outlet />
      </main>
    </>
  )
}
