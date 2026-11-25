'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/marketing/auth-shell'
import { useAuth } from '@/lib/hooks/use-auth'
import { api } from '@/lib/api/client'
import { teamAcceptPath, type TeamInvitePreview } from '@/lib/api/team'
import {
  closedInviteMessage,
  formatTeamDate,
  inviteSubtitle,
  type InviteClosedStatus,
} from '@/lib/dashboard/team'
import { ApiError } from '@/types/api'

type PreviewState =
  | { kind: 'loading' }
  | { kind: 'closed'; status: InviteClosedStatus }
  | { kind: 'error'; message: string }
  | { kind: 'valid'; preview: TeamInvitePreview }

const linkClass =
  'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

function AcceptInvite() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = (searchParams.get('token') || '').trim()
  const invitedEmail = (searchParams.get('email') || '').trim()
  const { isAuthenticated, loading, user, logout } = useAuth()
  const [state, setState] = useState<PreviewState>(
    token ? { kind: 'loading' } : { kind: 'closed', status: 'invalid' }
  )
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    api.team
      .previewInvite(token)
      .then((preview) => {
        if (cancelled) return
        setState(
          preview.status === 'valid'
            ? { kind: 'valid', preview }
            : { kind: 'closed', status: preview.status }
        )
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
          setState({ kind: 'closed', status: 'invalid' })
        } else if (err instanceof ApiError && err.status === 410) {
          setState({ kind: 'closed', status: 'expired' })
        } else {
          setState({
            kind: 'error',
            message: err instanceof Error && err.message ? err.message : 'Could not load this invite.',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const nextPath = token
    ? `${teamAcceptPath(token)}${invitedEmail ? `&email=${encodeURIComponent(invitedEmail)}` : ''}`
    : ''
  const loginHref = `/auth/login?next=${encodeURIComponent(nextPath)}`
  const registerQuery = new URLSearchParams({ next: nextPath })
  if (invitedEmail) registerQuery.set('email', invitedEmail)
  const registerHref = `/auth/register?${registerQuery.toString()}`

  const join = async () => {
    try {
      setJoining(true)
      setJoinError('')
      await api.team.acceptInvite(token)
      router.push('/dashboard/team')
    } catch (err) {
      setJoinError(err instanceof Error && err.message ? err.message : 'Could not join this team.')
      setJoining(false)
    }
  }

  if (state.kind === 'loading') {
    return (
      <AuthShell title="Join a team" subtitle="Checking your invite.">
        <div className="flex justify-center py-6" role="status" aria-label="Checking invite">
          <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
        </div>
      </AuthShell>
    )
  }

  if (state.kind === 'closed') {
    const message = closedInviteMessage(state.status)
    return (
      <AuthShell title={message.title} subtitle={message.body}>
        <Link href="/dashboard" className="btn-brand-outline w-full">
          Go to dashboard
        </Link>
      </AuthShell>
    )
  }

  if (state.kind === 'error') {
    return (
      <AuthShell title="Join a team" subtitle="Something went wrong while loading this invite.">
        <div
          role="alert"
          className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-card text-sm"
        >
          {state.message}
        </div>
        <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </AuthShell>
    )
  }

  const { preview } = state

  return (
    <AuthShell title="Join a team" subtitle={inviteSubtitle(preview.inviter_display_name, preview.plan_name)}>
      <div className="space-y-5">
        <dl className="space-y-2 text-sm">
          {preview.email_hint && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Invite sent to</dt>
              <dd className="font-medium text-ink">{preview.email_hint}</dd>
            </div>
          )}
          {preview.expires_at && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Expires</dt>
              <dd className="font-medium text-ink">{formatTeamDate(preview.expires_at)}</dd>
            </div>
          )}
        </dl>

        <div className="flex gap-2.5 rounded-card border border-surface-border/70 px-4 py-3 text-sm text-ink-muted">
          <Users className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            You keep your own login and API keys. Your calls use the team&apos;s shared allowance. If
            you pay for your own plan, cancel it before you join.
          </p>
        </div>

        {joinError && (
          <div
            role="alert"
            className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-card text-sm"
          >
            {joinError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-2" role="status" aria-label="Checking sign in">
            <Loader2 className="h-5 w-5 animate-spin text-ink-muted" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">
              Signed in as <span className="font-medium text-ink">{user.email}</span>
            </p>
            <Button
              type="button"
              className="w-full h-11 font-semibold hover:shadow-glow-lg motion-safe:hover:-translate-y-px"
              onClick={join}
              disabled={joining}
            >
              {joining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join team'
              )}
            </Button>
            <p className="text-center text-sm text-ink-muted">
              Not you?{' '}
              <button type="button" className={linkClass} onClick={logout} disabled={joining}>
                Use a different account
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button asChild className="w-full h-11 font-semibold">
              <Link href={loginHref}>Sign in</Link>
            </Button>
            <Link href={registerHref} className="btn-brand-outline w-full">
              Create account
            </Link>
            <p className="text-center text-xs text-ink-muted">
              Use the address this invite was sent to.
            </p>
          </div>
        )}
      </div>
    </AuthShell>
  )
}

export default function TeamAcceptPage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvite />
    </Suspense>
  )
}
