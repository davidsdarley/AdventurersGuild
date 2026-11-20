// AI-assisted: see AI-ATTRIBUTION.md
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { AuthCard, Field, Form, FormError, SubmitButton } from '../../components/AuthForm'
import { returnPathFrom } from '../../components/authRedirect'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useSession } from '../../data/auth'
import { logIn } from './login'

export function LoginPage() {
  const session = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session.loading && !busy) return <LoadingScreen />
  // Already signed in (for example, a reload of /login): go on to the app.
  if (session.user && !busy) return <Navigate to={returnPathFrom(location.state)} replace />

  const submit = async () => {
    setBusy(true)
    setError(null)
    const outcome = await logIn(email, password, location.state)
    if (outcome.ok) {
      navigate(outcome.to, { replace: true })
      return
    }
    setError(outcome.error)
    setBusy(false)
  }

  return (
    <AuthCard title="Log in">
      <Form onSubmit={() => void submit()}>
        <FormError message={error} />
        <Field label="Email" name="email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        <SubmitButton busy={busy}>Log in</SubmitButton>
      </Form>
      <div className="mt-4 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-gray-700 underline hover:text-gray-900">
          Forgot password?
        </Link>
        <Link to="/register" className="text-gray-700 underline hover:text-gray-900">
          Register
        </Link>
      </div>
    </AuthCard>
  )
}
