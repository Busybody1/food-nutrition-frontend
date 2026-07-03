'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthShell } from '@/components/marketing/auth-shell'
import { useAuth } from '@/lib/hooks/use-auth'
import { getPostLoginPath } from '@/lib/auth/post-login-path'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.push(getPostLoginPath(user))
    }
  }, [isAuthenticated, loading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login({ email, password })
      if (result.success) {
        router.push(getPostLoginPath(result.user))
      } else {
        setError(result.error || 'Login failed')
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

  return (
    <AuthShell
      title="Sign in"
      subtitle={
        <>
          Or{' '}
          <Link href="/auth/register" className={linkClass}>
            create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-card text-sm"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-brand cursor-pointer text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold hover:shadow-glow-lg motion-safe:hover:-translate-y-px"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-surface-border/70 pt-5 text-center">
        <p className="text-sm text-ink-muted">No account?</p>
        <Link href="/auth/register" className="btn-brand-outline mt-3 w-full">
          Sign up free
        </Link>
      </div>
    </AuthShell>
  )
}
