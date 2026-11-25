'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  CalendarClock,
  CalendarRange,
  Camera,
  Coins,
  Gauge,
  Images,
  KeyRound,
  ListChecks,
  RefreshCw,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useImageCalorie } from '@/contexts/ImageCalorieContext'
import { Button } from '@/components/ui/button'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'
import {
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardEmpty,
  DashboardPage,
  DashboardPageHeader,
  DashboardPageSkeleton,
  DashboardPanel,
  DashboardPanelBody,
  DashboardPanelHeader,
  DashboardPill,
  DashboardProgress,
  DashboardSegmented,
  DashboardStatCard,
  InfoHint,
} from '@/components/dashboard/dashboard-shell'
import {
  apiKeysHref,
  codeSamples,
  countingRules,
  endpointUrl,
  errorRows,
  exampleResponse,
  limitCards,
  meterLabel,
  responseNotes,
  usageMissing,
  type CodeLanguage,
} from '@/lib/dashboard/image-calorie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'curl', label: 'cURL' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
]

const CARD_ICONS: Record<string, LucideIcon> = {
  month: Gauge,
  today: CalendarClock,
  ends: CalendarRange,
  trial: Gauge,
  balance: Coins,
  cost: Camera,
  left: Images,
}

const PAGE_INFO =
  'Send a food photo to the API and get calories and macros for each item on the plate. Limits and usage on this page are for this account.'

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex min-w-0 gap-4">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dash-teal-soft text-[13px] font-semibold text-dash-teal-strong"
        aria-hidden
      >
        {number}
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <h3 className="text-[14px] font-semibold leading-7 text-dash-ink">{title}</h3>
        {children}
      </div>
    </li>
  )
}

export default function ImageToCaloriePage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { access, loading, failed, refresh } = useImageCalorie()
  const [language, setLanguage] = useState<CodeLanguage>('curl')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login')
  }, [authLoading, isAuthenticated, router])

  const reload = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardPage>
        <DashboardPageSkeleton kpis={3} label="Loading image to calories" />
      </DashboardPage>
    )
  }

  const refreshButton = (
    <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={reload} disabled={refreshing}>
      <RefreshCw
        className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
        strokeWidth={DASHBOARD_ICON_STROKE}
        aria-hidden
      />
      Refresh
    </Button>
  )

  if (!access.available) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Image to calories" meta={<InfoHint text={PAGE_INFO} />}>
          {refreshButton}
        </DashboardPageHeader>
        {failed && (
          <DashboardAlert variant="error">Photo access could not be loaded. Try Refresh.</DashboardAlert>
        )}
        <DashboardPanel>
          <DashboardEmpty
            icon={Camera}
            title="Image to calories is not on this account"
            description="Photo analysis comes with Enterprise and Custom plans."
            action={
              <Button asChild size="sm" className="h-9">
                <Link href="/contact">Contact sales</Link>
              </Button>
            }
          />
        </DashboardPanel>
      </DashboardPage>
    )
  }

  const cards = limitCards(access)
  const url = endpointUrl(API_BASE_URL, access.endpoint)
  const samples = codeSamples(url, access.file_field)
  const rows = errorRows(access.meter)
  const mcpKey = access.key_product === 'mcp'

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Image to calories"
        meta={
          <>
            <DashboardPill tone="brand">{meterLabel(access.meter)}</DashboardPill>
            <InfoHint text={PAGE_INFO} />
          </>
        }
      >
        {refreshButton}
      </DashboardPageHeader>

      {usageMissing(access) && (
        <DashboardAlert variant="warning">Usage could not be loaded right now. Try Refresh.</DashboardAlert>
      )}

      {cards.length > 0 && (
        <div className={cards.length === 2 ? 'dashboard-grid-halves' : 'dashboard-grid-kpi'}>
          {cards.map((card) => (
            <DashboardStatCard
              key={card.key}
              label={card.label}
              value={<span className="tabular-nums">{card.value}</span>}
              hint={card.hint}
              icon={CARD_ICONS[card.key] ?? Gauge}
              accent="brand"
              footer={
                card.percent === null ? undefined : (
                  <DashboardProgress className="h-2" value={card.percent} max={100} />
                )
              }
            />
          ))}
        </div>
      )}

      <DashboardPanel>
        <DashboardPanelHeader title="How to use" icon={BookOpen} />
        <DashboardPanelBody>
          <ol className="space-y-8">
            <Step number={1} title="Use an API key">
              <p className="max-w-2xl text-[13px] leading-5 text-dash-body">
                {mcpKey
                  ? 'Use a key from the MCP tab. It works for this endpoint. Send it in the X-API-Key header.'
                  : 'Send one of your REST API keys in the X-API-Key header.'}{' '}
                A dashboard login cannot call this endpoint.
              </p>
              <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                <Link href={apiKeysHref(access)}>
                  <KeyRound className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                  {mcpKey ? 'MCP keys' : 'REST API keys'}
                </Link>
              </Button>
            </Step>

            <Step number={2} title="Send a photo">
              <p className="break-all font-mono text-[13px] text-dash-ink">
                <span className="mr-2 rounded-md bg-dash-pill px-1.5 py-0.5 text-[12px] font-semibold text-dash-body">
                  {access.method}
                </span>
                {url}
              </p>
              <DashboardSegmented
                value={language}
                options={LANGUAGES}
                onChange={setLanguage}
                ariaLabel="Code language"
              />
              <DocsCodeBlock
                title={LANGUAGES.find((item) => item.value === language)?.label}
                code={samples[language]}
                copyable
                className="mb-0"
              />
            </Step>

            <Step number={3} title="Read the estimate">
              <DocsCodeBlock title="200 OK" code={exampleResponse(access)} copyable className="mb-0" />
              <ul className="list-disc space-y-1 pl-5 text-[13px] leading-5 text-dash-body">
                {responseNotes(access).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Step>
          </ol>
        </DashboardPanelBody>
      </DashboardPanel>

      <div className="dashboard-grid-narrow-wide">
        <DashboardPanel>
          <DashboardPanelHeader title="Rules" icon={ListChecks} />
          <DashboardPanelBody>
            <ul className="list-disc space-y-2 pl-5 text-[13px] leading-5 text-dash-body">
              {countingRules(access).map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </DashboardPanelBody>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardPanelHeader
            title="Errors"
            icon={TriangleAlert}
            actions={
              <InfoHint text="Errors from the photo endpoint have an object in detail with a code. Errors from earlier checks (key, rate limit) have a plain text detail. Handle both." />
            }
          />
          <DashboardPanelBody flush>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Code</th>
                    <th className="hidden sm:table-cell">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.status}-${row.code ?? row.meaning}`}>
                      <td className="tabular-nums font-medium text-dash-ink">{row.status}</td>
                      <td className="text-dash-body">
                        <span className="break-all font-mono text-[12px]">{row.code ?? 'plain text'}</span>
                        <span className="mt-0.5 block text-[12px] text-dash-muted sm:hidden">{row.meaning}</span>
                      </td>
                      <td className="hidden text-dash-body sm:table-cell">{row.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardPanelBody>
        </DashboardPanel>
      </div>
    </DashboardPage>
  )
}
