export const REST_CARD_TRIAL_DAYS = 5

const REST_CHARGE_NOTE = 'A card is required. We charge it after 5 days unless you cancel.'

export function isRestPaidPlan(plan: {
  name: string
  plan_tier?: string | null
  monthly_price?: number | null
}): boolean {
  const name = plan.name.trim().toLowerCase()
  const tier = (plan.plan_tier || '').trim().toLowerCase()
  if (name === 'free' || name === 'enterprise' || name === 'custom' || name === 'mcp') return false
  if (tier === 'mcp' || tier === 'enterprise' || tier === 'custom' || tier === 'free') return false
  return (plan.monthly_price ?? 0) > 0
}

export function restSubscribeLabel(input: {
  paid: boolean
  trialDays: number | null
  offerPending: boolean
}): string | null {
  if (!input.paid || input.offerPending || input.trialDays !== REST_CARD_TRIAL_DAYS) return null
  return 'Start 5-day trial'
}

export function restTrialChargeNote(trialDays: number | null): string | null {
  if (trialDays !== REST_CARD_TRIAL_DAYS) return null
  return REST_CHARGE_NOTE
}
