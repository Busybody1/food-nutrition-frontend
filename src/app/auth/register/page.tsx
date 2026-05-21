'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthShell } from '@/components/marketing/auth-shell'
import { useAuth } from '@/lib/hooks/use-auth'
import { isDuplicateEmailMessage } from '@/lib/api/errors'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

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
  const inputClass = 'bg-white border-surface-border text-ink'

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Or{' '}
          <Link href="/auth/login" className="text-brand hover:text-brand-soft">
            sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-card text-sm">
            <p>{error}</p>
            {isDuplicateEmailMessage(error) && (
              <p className="mt-2 text-ink-muted">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-brand hover:text-brand-soft font-medium">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className={labelClass}>First name</label>
            <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last name</label>
            <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className={inputClass} />
        </div>

        <div>
          <label htmlFor="companyName" className={labelClass}>Company (optional)</label>
          <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} className={inputClass} />
        </div>

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
              className={`${inputClass} pr-10`}
            />
            <button type="button" className="absolute inset-y-0 right-0 pr-3 text-ink-dim" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-ink-dim mt-1">At least 8 characters</p>
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
              className={`${inputClass} pr-10`}
            />
            <button type="button" className="absolute inset-y-0 right-0 pr-3 text-ink-dim" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 rounded border-surface-border"
          />
          <span>
            I agree to the <Link href="/terms" className="text-brand hover:underline">Terms</Link> and{' '}
            <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>
          </span>
        </label>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Create account
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
