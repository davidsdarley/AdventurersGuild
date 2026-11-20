// AI-assisted: see AI-ATTRIBUTION.md
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { AuthCard, Field, Form, FormError, SubmitButton } from '../../components/AuthForm'
import { DEFAULT_PATH } from '../../components/authRedirect'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useSession } from '../../data/auth'
import { MIN_PASSWORD_LENGTH, register } from './register'

export function RegisterPage() {
  const session = useSession()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session.loading && !busy) return <LoadingScreen />
  if (session.user && !busy) return <Navigate to={DEFAULT_PATH} replace />

  const submit = async () => {
    setBusy(true)
    setError(null)
    const outcome = await register({ username, email, password, inviteCode })
    if (outcome.ok) {
      // Email confirmation is off, so sign-up has already signed the user in.
      navigate(DEFAULT_PATH, { replace: true })
      return
    }
    setError(outcome.error)
    setBusy(false)
  }

  return (
    <AuthCard title="Register">
      <Form onSubmit={() => void submit()}>
        <FormError message={error} />
        <Field
          label="Username"
          name="username"
          autoComplete="username"
          minLength={3}
          maxLength={24}
          value={username}
          onChange={setUsername}
        />
        <Field label="Email" name="email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={setPassword}
        />
        <Field label="Invite code" name="invite-code" autoComplete="off" value={inviteCode} onChange={setInviteCode} />
        <SubmitButton busy={busy}>Register</SubmitButton>
      </Form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-gray-700 underline hover:text-gray-900">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}
