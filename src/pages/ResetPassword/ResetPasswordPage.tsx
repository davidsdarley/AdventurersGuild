// AI-assisted: see AI-ATTRIBUTION.md
import { useState } from 'react'
import { Link } from 'react-router'
import { AuthCard, Field, Form, FormError, SubmitButton } from '../../components/AuthForm'
import { DEFAULT_PATH } from '../../components/authRedirect'
import { LoadingScreen } from '../../components/LoadingScreen'
import { updatePassword, useSession } from '../../data/auth'
import { MIN_PASSWORD_LENGTH } from '../Register/register'

// Opened from the reset email. Supabase reads the token from the URL and
// signs the user in, so a session means the link was valid.
export function ResetPasswordPage() {
  const session = useSession()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session.loading) return <LoadingScreen />

  if (!session.user) {
    return (
      <AuthCard title="Reset password">
        <p className="text-gray-700">This reset link is invalid or has expired.</p>
        <p className="mt-4 text-sm">
          <Link to="/forgot-password" className="text-gray-700 underline hover:text-gray-900">
            Request a new link
          </Link>
        </p>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard title="Reset password">
        <p role="status" className="text-gray-700">
          Your password has been changed.
        </p>
        <p className="mt-4 text-sm">
          <Link to={DEFAULT_PATH} className="text-gray-700 underline hover:text-gray-900">
            Go to Guild Records
          </Link>
        </p>
      </AuthCard>
    )
  }

  const submit = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await updatePassword(password)
      setDone(true)
    } catch {
      setError("Couldn't change your password, please try again")
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Reset password">
      <Form onSubmit={() => void submit()}>
        <FormError message={error} />
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={setPassword}
        />
        <Field
          label="Confirm new password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={confirm}
          onChange={setConfirm}
        />
        <SubmitButton busy={busy}>Set new password</SubmitButton>
      </Form>
    </AuthCard>
  )
}
