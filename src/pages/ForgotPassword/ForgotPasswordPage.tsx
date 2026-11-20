// AI-assisted: see AI-ATTRIBUTION.md
import { useState } from 'react'
import { Link } from 'react-router'
import { AuthCard, Field, Form, FormError, SubmitButton } from '../../components/AuthForm'
import { requestPasswordReset } from '../../data/auth'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
    } catch {
      setError("Couldn't send the reset email, please try again in a few minutes")
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Forgot password">
      {sent ? (
        // Same message whether or not the email has an account.
        <p role="status" className="text-gray-700">
          If an account exists for {email.trim()}, a link to reset your password is on its way.
        </p>
      ) : (
        <Form onSubmit={() => void submit()}>
          <p className="text-sm text-gray-600">Enter your email and we'll send you a link to set a new password.</p>
          <FormError message={error} />
          <Field label="Email" name="email" type="email" autoComplete="email" value={email} onChange={setEmail} />
          <SubmitButton busy={busy}>Send reset link</SubmitButton>
        </Form>
      )}
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-gray-700 underline hover:text-gray-900">
          Back to Log in
        </Link>
      </p>
    </AuthCard>
  )
}
