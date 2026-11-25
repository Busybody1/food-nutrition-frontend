'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthShell } from '@/components/marketing/auth-shell'
import { useAuth } from '@/lib/hooks/use-auth'
import { isDuplicateEmailMessage } from '@/lib/api/errors'
import { safeNextPath } from '@/lib/mcp/catalog'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [nextPath, setNextPath] = useState<string | null>(null)

  const { register } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const invitedEmail = (params.get('email') || '').trim()
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setNextPath(safeNextPath(params.get('next')))
    if (invitedEmail) {
      setFormData((prev) => (prev.email ? prev : { ...prev, email: invitedEmail }))
    }
  }, [])

  const loginHref = nextPath ? `/auth/login?next=${encodeURIComponent(nextPath)}` : '/auth/login'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }
    if (!agreedToTerms) {
      setError('Please agree to the terms and privacy policy')
      setIsLoading(false)
      return
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName || undefined,
      })
      if (result.success) {
        const query = new URLSearchParams({ email: formData.email })
        if (nextPath) query.set('next', nextPath)
        router.push(`/auth/verify-email?${query.toString()}`)
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const labelClass = 'marketing-label'
  const linkClass =
    'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
  const toggleClass =
    'absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-xl cursor-pointer text-mk-muted hover:text-mk-ink transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Or{' '}
          <Link href={loginHref} className={linkClass}>
            sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            role="alert"
            className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-xl text-sm"
          >
            <p>{error}</p>
            {isDuplicateEmailMessage(error) && (
              <p className="mt-2 text-mk-muted">
                Already have an account?{' '}
                <Link href={loginHref} className={`${linkClass} font-medium`}>
                  Sign in
                </Link>
              </p>
            )}
          </div>
        )}

        {}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
            <div>
              <label htmlFor="firstName" className={labelClass}>First name</label>
              <input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="marketing-input" />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Last name</label>
              <input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="marketing-input" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className="marketing-input" />
          </div>

          <div>
            <label htmlFor="companyName" className="marketing-label font-normal text-mk-muted">Company (optional)</label>
            <input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} className="marketing-input" />
          </div>
        </div>

        {}
        <div className="space-y-4 border-t border-mk-hair pt-5">
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="marketing-input pr-10"
              />
              <button
                type="button"
                className={toggleClass}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-mk-muted">At least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="marketing-input pr-10"
              />
              <button
                type="button"
                className={toggleClass}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-mk-muted cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 rounded border-mk-line accent-mk-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            />
            <span>
              I agree to the <Link href="/terms" className={linkClass}>Terms</Link> and{' '}
              <Link href="/privacy" className={linkClass}>Privacy Policy</Link>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="btn-brand w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthShell>
  )
}
