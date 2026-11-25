import { ScanBarcode, Search } from 'lucide-react'
import { CowIcon, DropIcon, EggIcon, FishIcon, GrainsIcon, NutIcon } from '@phosphor-icons/react/ssr'
import { BananaFillIcon, DrumstickFillIcon } from '@/components/marketing/food-icons'
import { cn } from '@/lib/utils/cn'
import { MarketingIconDisc, type DiscTone, type MarketingIcon } from '@/components/marketing/marketing-shell'
import { MarketingFloatCard, MarketingFloatStack } from '@/components/marketing/marketing-cards'

type ExampleFood = {
  name: string
  brand?: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  icon: MarketingIcon
  tone: DiscTone
}

export const EXAMPLE_FOODS = {
  fageGreekYogurt: {
    name: 'Total 0% Greek Yogurt',
    brand: 'Fage',
    kcal: 55,
    protein: 10.3,
    carbs: 3,
    fat: 0,
    icon: CowIcon,
    tone: 'blue',
  },
  banana: {
    name: 'Banana, raw',
    kcal: 87.6,
    protein: 1.1,
    carbs: 19.7,
    fat: 0.2,
    icon: BananaFillIcon,
    tone: 'green',
  },
  chickenBreast: {
    name: 'Chicken breast, roasted',
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.8,
    icon: DrumstickFillIcon,
    tone: 'coral',
  },
  oatlyOatMilk: {
    name: 'Oat Milk',
    brand: 'Oatly',
    kcal: 50,
    protein: 1.2,
    carbs: 6.7,
    fat: 2.1,
    icon: DropIcon,
    tone: 'violet',
  },
  nutellaSpread: {
    name: 'Hazelnut Spread',
    brand: 'Nutella',
    kcal: 539,
    protein: 6.3,
    carbs: 57.5,
    fat: 30.9,
    icon: NutIcon,
    tone: 'coral',
  },
  salmon: {
    name: 'Atlantic salmon, cooked',
    kcal: 182,
    protein: 25.4,
    carbs: 0,
    fat: 8.1,
    icon: FishIcon,
    tone: 'blue',
  },
  brownRice: {
    name: 'Brown rice, cooked',
    kcal: 123,
    protein: 2.4,
    carbs: 25.8,
    fat: 1.1,
    icon: GrainsIcon,
    tone: 'green',
  },
  chobaniGreekYoghurt: {
    name: 'Greek Yoghurt',
    brand: 'Chobani',
    kcal: 55.6,
    protein: 9.3,
    carbs: 4,
    fat: 0,
    icon: CowIcon,
    tone: 'blue',
  },
  boiledEgg: {
    name: 'Egg, hard-boiled',
    kcal: 155,
    protein: 12.6,
    carbs: 1.1,
    fat: 10.6,
    icon: EggIcon,
    tone: 'violet',
  },
} as const satisfies Record<string, ExampleFood>

export const HERO_EXAMPLE_FOODS: readonly ExampleFood[] = [
  EXAMPLE_FOODS.fageGreekYogurt,
  EXAMPLE_FOODS.banana,
  EXAMPLE_FOODS.chickenBreast,
]

export const SPLIT_EXAMPLE_FOODS: readonly ExampleFood[] = [
  EXAMPLE_FOODS.oatlyOatMilk,
  EXAMPLE_FOODS.nutellaSpread,
  EXAMPLE_FOODS.salmon,
]

export const EXAMPLE_BARCODE = '9310653103517'

function BrandChip({ brand }: { brand: string }) {
  return (
    <span className="mr-1.5 inline-flex translate-y-[-1px] items-center rounded-full bg-[#E6F9FB] px-2 py-0.5 align-middle text-[11px] font-semibold leading-none text-brand-strong">
      {brand}
    </span>
  )
}

function FoodName({ food, className }: { food: ExampleFood; className?: string }) {
  return (
    <span className={cn('min-w-0 flex-1 text-sm font-semibold leading-snug text-mk-ink', className)}>
      {food.brand && <BrandChip brand={food.brand} />}
      {food.name}
    </span>
  )
}

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
        <FoodName food={food} />
        <KcalFigure kcal={food.kcal} />
      </div>
      {withMacros && <MacroFigures food={food} className="mt-3" />}
    </MarketingFloatCard>
  )
}

export function ExampleResponseStack({
  foods = HERO_EXAMPLE_FOODS,
  withMacros = false,
  className,
}: {
  foods?: readonly ExampleFood[]
  withMacros?: boolean
  className?: string
}) {
  return (
    <MarketingFloatStack className={className}>
      {foods.map((food) => (
        <ExampleResponseCard key={food.name} food={food} withMacros={withMacros} />
      ))}
    </MarketingFloatStack>
  )
}

export function SearchPreviewStage() {
  const food = EXAMPLE_FOODS.brownRice
  return (
    <div className="w-full max-w-[300px] space-y-2">
      <div className="flex h-9 items-center gap-2 rounded-xl border border-mk-line bg-white px-3 text-sm text-mk-ink">
        <Search className="h-3.5 w-3.5 shrink-0 text-mk-muted" />
        <span className="truncate">brown rice</span>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-mk-hair bg-white px-3 py-2 shadow-card">
        <MarketingIconDisc icon={food.icon} tone={food.tone} className="h-5 w-5 [&>svg]:h-5 [&>svg]:w-5" />
        <FoodName food={food} className="truncate text-[13px] font-medium" />
        <KcalFigure kcal={food.kcal} className="text-[13px]" />
      </div>
    </div>
  )
}

export function BarcodePreviewStage() {
  const food = EXAMPLE_FOODS.chobaniGreekYoghurt
  return (
    <div className="w-full max-w-[300px] space-y-2">
      <div className="flex h-9 items-center gap-2 rounded-xl border border-mk-line bg-white px-3 font-mono text-[13px] tracking-wider text-mk-ink">
        <ScanBarcode className="h-3.5 w-3.5 shrink-0 text-mk-muted" />
        <span className="truncate">{EXAMPLE_BARCODE}</span>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-mk-hair bg-white px-3 py-2 shadow-card">
        <span className="h-2 w-2 shrink-0 rounded-full bg-mk-green" />
        <FoodName food={food} className="text-[13px] font-medium" />
        <KcalFigure kcal={food.kcal} className="text-[13px]" />
      </div>
    </div>
  )
}

export function MacroPreviewStage() {
  const food = EXAMPLE_FOODS.boiledEgg
  return (
    <div className="w-full max-w-[300px] rounded-xl border border-mk-hair bg-white p-2.5 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <span className="text-[13px] font-medium text-mk-ink">{food.name}</span>
        <KcalFigure kcal={food.kcal} className="text-[13px]" />
      </div>
      <MacroFigures food={food} />
    </div>
  )
}

export function ExampleFoodCollage() {
  const search = EXAMPLE_FOODS.brownRice
  const barcode = EXAMPLE_FOODS.chobaniGreekYoghurt
  const macro = EXAMPLE_FOODS.boiledEgg
  return (
    <div className="relative grid items-start gap-3 p-4 sm:grid-cols-2 sm:p-6" aria-hidden>
      <MarketingFloatCard className="min-w-0 shadow-card">
        <div className="flex items-center gap-3">
          <MarketingIconDisc icon={search.icon} tone={search.tone} />
          <FoodName food={search} className="truncate" />
          <KcalFigure kcal={search.kcal} />
        </div>
        <MacroFigures food={search} className="mt-3" />
      </MarketingFloatCard>
      <div className="min-w-0 space-y-3 sm:translate-y-6">
        <MarketingFloatCard className="shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-mk-stage px-3 font-mono text-xs tracking-wider text-mk-ink">
              <ScanBarcode className="h-3.5 w-3.5 text-mk-muted" />
              {EXAMPLE_BARCODE}
            </span>
            <FoodName food={barcode} className="truncate" />
          </div>
        </MarketingFloatCard>
        <MarketingFloatCard className="shadow-card">
          <div className="flex items-center gap-3">
            <MarketingIconDisc icon={macro.icon} tone={macro.tone} />
            <FoodName food={macro} className="truncate" />
            <KcalFigure kcal={macro.kcal} />
          </div>
          <MacroFigures food={macro} className="mt-3" />
        </MarketingFloatCard>
      </div>
    </div>
  )
}
