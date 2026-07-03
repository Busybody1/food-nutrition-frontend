'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthShell } from '@/components/marketing/auth-shell'
import { useAuth } from '@/lib/hooks/use-auth'
import { isDuplicateEmailMessage } from '@/lib/api/errors'
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

  const { register } = useAuth()
  const router = useRouter()

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
        router.push('/auth/login')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const labelClass = 'block text-sm font-medium text-ink-muted mb-1'
  const linkClass =
    'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'
  const toggleClass =
    'absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-brand cursor-pointer text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Or{' '}
          <Link href="/auth/login" className={linkClass}>
            sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            role="alert"
            className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-card text-sm"
          >
            <p>{error}</p>
            {isDuplicateEmailMessage(error) && (
              <p className="mt-2 text-ink-muted">
                Already have an account?{' '}
                <Link href="/auth/login" className={`${linkClass} font-medium`}>
                  Sign in
                </Link>
              </p>
            )}
          </div>
        )}

        {/* Identity */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
            <div>
              <label htmlFor="firstName" className={labelClass}>First name</label>
              <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="h-11" />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Last name</label>
              <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="h-11" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className="h-11" />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-normal text-ink-muted mb-1">Company (optional)</label>
            <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} className="h-11" />
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4 border-t border-surface-border/70 pt-5">
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="h-11 pr-10"
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
            <p className="text-xs text-ink-muted mt-1">At least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="h-11 pr-10"
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

          <label className="flex items-start gap-2 text-sm text-ink-muted cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 rounded border-surface-border accent-brand cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1"
            />
            <span>
              I agree to the <Link href="/terms" className={linkClass}>Terms</Link> and{' '}
              <Link href="/privacy" className={linkClass}>Privacy Policy</Link>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold hover:shadow-glow-lg motion-safe:hover:-translate-y-px"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
