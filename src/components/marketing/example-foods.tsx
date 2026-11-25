import { Banana, Drumstick, Milk, ScanBarcode, Search, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { MarketingIconDisc, type DiscTone } from '@/components/marketing/marketing-shell'
import { MarketingFloatCard, MarketingFloatStack } from '@/components/marketing/marketing-cards'

export const EXAMPLE_RESPONSE_LABEL = 'Example response'

type ExampleFood = {
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  icon: LucideIcon
  tone: DiscTone
}

export const EXAMPLE_FOODS = {
  greekYogurt: {
    name: 'Greek yogurt',
    kcal: 97,
    protein: 9,
    carbs: 4,
    fat: 5,
    icon: Milk,
    tone: 'blue',
  },
  banana: {
    name: 'Banana',
    kcal: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    icon: Banana,
    tone: 'green',
  },
  chickenBreast: {
    name: 'Cooked chicken breast',
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    icon: Drumstick,
    tone: 'coral',
  },
} as const satisfies Record<string, ExampleFood>

const EXAMPLE_FOOD_LIST: readonly ExampleFood[] = [
  EXAMPLE_FOODS.greekYogurt,
  EXAMPLE_FOODS.banana,
  EXAMPLE_FOODS.chickenBreast,
]

export const EXAMPLE_BARCODE = '012345678905'

function KcalFigure({ kcal, className }: { kcal: number; className?: string }) {
  return (
    <span className={cn('whitespace-nowrap text-sm font-semibold tabular-nums text-mk-ink', className)}>
      {kcal} <span className="font-normal text-mk-muted">kcal/100g</span>
    </span>
  )
}

function MacroFigures({ food, className }: { food: ExampleFood; className?: string }) {
  const macros = [
    { label: 'Protein', value: food.protein },
    { label: 'Carbs', value: food.carbs },
    { label: 'Fat', value: food.fat },
  ]
  return (
    <dl className={cn('grid grid-cols-3 gap-2', className)}>
      {macros.map(({ label, value }) => (
        <div key={label} className="flex min-w-0 flex-col-reverse rounded-xl bg-mk-stage px-2.5 py-2">
          <dt className="text-[11px] text-mk-muted">{label}</dt>
          <dd className="text-sm font-semibold tabular-nums text-mk-ink">{value} g</dd>
        </div>
      ))}
    </dl>
  )
}

export function ExampleResponseCard({ food, withMacros = false }: { food: ExampleFood; withMacros?: boolean }) {
  return (
    <MarketingFloatCard>
      <div className="flex items-center gap-3">
        <MarketingIconDisc icon={food.icon} tone={food.tone} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-mk-muted">{EXAMPLE_RESPONSE_LABEL}</p>
          <p className="text-sm font-semibold leading-snug text-mk-ink">{food.name}</p>
        </div>
        <KcalFigure kcal={food.kcal} />
      </div>
      {withMacros && <MacroFigures food={food} className="mt-3" />}
    </MarketingFloatCard>
  )
}

export function ExampleResponseStack({
  withMacros = false,
  className,
}: {
  withMacros?: boolean
  className?: string
}) {
  return (
    <MarketingFloatStack className={className}>
      {EXAMPLE_FOOD_LIST.map((food) => (
        <ExampleResponseCard key={food.name} food={food} withMacros={withMacros} />
      ))}
    </MarketingFloatStack>
  )
}

export function SearchPreviewStage() {
  const food = EXAMPLE_FOODS.chickenBreast
  return (
    <div className="w-full max-w-[300px] space-y-2">
      <div className="flex h-9 items-center gap-2 rounded-xl border border-mk-line bg-white px-3 text-sm text-mk-ink">
        <Search className="h-3.5 w-3.5 shrink-0 text-mk-muted" />
        <span className="truncate">chicken breast</span>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-mk-hair bg-white px-3 py-2 shadow-card">
        <MarketingIconDisc icon={food.icon} tone={food.tone} className="h-7 w-7 [&>svg]:h-3.5 [&>svg]:w-3.5" />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-mk-ink">{food.name}</span>
        <KcalFigure kcal={food.kcal} className="text-[13px]" />
      </div>
    </div>
  )
}

export function BarcodePreviewStage() {
  const food = EXAMPLE_FOODS.greekYogurt
  return (
    <div className="w-full max-w-[300px] space-y-2">
      <div className="flex h-9 items-center gap-2 rounded-xl border border-mk-line bg-white px-3 font-mono text-[13px] tracking-wider text-mk-ink">
        <ScanBarcode className="h-3.5 w-3.5 shrink-0 text-mk-muted" />
        <span className="truncate">{EXAMPLE_BARCODE}</span>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-mk-hair bg-white px-3 py-2 shadow-card">
        <span className="h-2 w-2 shrink-0 rounded-full bg-mk-green" />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-mk-ink">{food.name}</span>
        <KcalFigure kcal={food.kcal} className="text-[13px]" />
      </div>
    </div>
  )
}

export function MacroPreviewStage() {
  const food = EXAMPLE_FOODS.banana
  return (
    <div className="w-full max-w-[300px] rounded-xl border border-mk-hair bg-white p-2.5 shadow-card">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <span className="text-[13px] font-medium text-mk-ink">{food.name}</span>
        <KcalFigure kcal={food.kcal} className="text-[13px]" />
      </div>
      <MacroFigures food={food} />
    </div>
  )
}

export function ExampleFoodCollage() {
  const search = EXAMPLE_FOODS.chickenBreast
  const barcode = EXAMPLE_FOODS.greekYogurt
  const macro = EXAMPLE_FOODS.banana
  return (
    <div className="relative grid items-start gap-3 p-4 sm:grid-cols-2 sm:p-6" aria-hidden>
      <MarketingFloatCard className="min-w-0 shadow-card">
        <p className="mb-2 text-xs font-medium text-mk-muted">{EXAMPLE_RESPONSE_LABEL}</p>
        <div className="flex items-center gap-3">
          <MarketingIconDisc icon={search.icon} tone={search.tone} />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-mk-ink">{search.name}</span>
          <KcalFigure kcal={search.kcal} />
        </div>
        <MacroFigures food={search} className="mt-3" />
      </MarketingFloatCard>
      <div className="min-w-0 space-y-3 sm:translate-y-6">
        <MarketingFloatCard className="shadow-card">
          <p className="mb-2 text-xs font-medium text-mk-muted">{EXAMPLE_RESPONSE_LABEL}</p>
          <div className="flex items-center gap-3">
            <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-mk-stage px-3 font-mono text-xs tracking-wider text-mk-ink">
              <ScanBarcode className="h-3.5 w-3.5 text-mk-muted" />
              {EXAMPLE_BARCODE}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-mk-ink">{barcode.name}</span>
          </div>
        </MarketingFloatCard>
        <MarketingFloatCard className="shadow-card">
          <div className="flex items-center gap-3">
            <MarketingIconDisc icon={macro.icon} tone={macro.tone} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-mk-ink">{macro.name}</span>
            <KcalFigure kcal={macro.kcal} />
          </div>
          <MacroFigures food={macro} className="mt-3" />
        </MarketingFloatCard>
      </div>
    </div>
  )
}
