import { MarketingFloatCard } from '@/components/marketing/marketing-cards'

const MCP_TRANSCRIPT: { who: string; text: string; code?: string }[] = [
  { who: 'You', text: 'How many calories and how much protein are in 180 g of cooked chicken breast?' },
  {
    who: 'search_foods',
    text: 'Cooked chicken breast, per 100 g.',
    code: '{ "kcal": 165, "protein_g": 31 } per 100 g',
  },
  {
    who: 'calculate_portion',
    text: 'Same food, scaled to 180 g.',
    code: '{ "kcal": 297, "protein_g": 55.8 }',
  },
]

export function McpTranscript() {
  return (
    <ol className="mx-auto max-w-md space-y-3">
      {MCP_TRANSCRIPT.map((turn) => {
        const isYou = turn.who === 'You'
        return (
          <li key={turn.who} className={isYou ? 'flex justify-end' : ''}>
            {isYou ? (
              <div className="max-w-[90%] rounded-2xl rounded-br-md bg-brand px-4 py-3 text-mk-ink shadow-float">
                <p className="text-xs font-medium text-mk-ink/70">{turn.who}</p>
                <p className="mt-1 text-[15px] leading-relaxed">{turn.text}</p>
              </div>
            ) : (
              <MarketingFloatCard className="max-w-[90%] p-4">
                <p className="font-mono text-xs font-medium text-mk-muted">{turn.who}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-mk-ink">{turn.text}</p>
                {turn.code ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-[#0f172a] px-4 py-3 font-mono text-xs leading-relaxed text-slate-200">
                    {turn.code}
                  </pre>
                ) : null}
              </MarketingFloatCard>
            )}
          </li>
        )
      })}
    </ol>
  )
}
