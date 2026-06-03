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
  const inputClass = 'bg-white border-surface-border text-ink'

  return (
    <AuthShell
      title="Sign in"
      subtitle={
        <>
          Or{' '}
          <Link href="/auth/register" className="text-brand hover:text-brand-soft">
            create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-card text-sm">
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
            className={inputClass}
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
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-dim"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
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

      <p className="mt-6 text-center text-sm text-ink-dim">
        No account?{' '}
        <Link href="/auth/register" className="text-brand hover:underline">
          Sign up free
        </Link>
      </p>
    </AuthShell>
  )
}
