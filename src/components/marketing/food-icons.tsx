import { forwardRef } from 'react'
import type { IconProps } from '@phosphor-icons/react'

const BANANA_BODY =
  'M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11.5 2 13 2c3.22 0 5 5.5 5 8 0 6.5-4.2 12-10.49 12C5.11 22 2 22 2 20c0-1.5 1.14-1.55 3.15-2.11Z'
const BANANA_PEEL = 'M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5'
const DRUMSTICK_MEAT = 'M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23'
const DRUMSTICK_BONE = 'm8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59'

function svgProps({ size, color, weight, mirrored, alt, ...rest }: IconProps) {
  return {
    ...rest,
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    width: size ?? '1em',
    height: size ?? '1em',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    color,
    transform: mirrored ? 'scale(-1, 1)' : undefined,
    'aria-label': alt,
    'data-weight': weight,
  }
}

export const BananaFillIcon = forwardRef<SVGSVGElement, IconProps>(function BananaFillIcon(props, ref) {
  return (
    <svg ref={ref} {...svgProps(props)}>
      <path d={BANANA_BODY} fill="currentColor" strokeWidth={1.5} />
      <path d={BANANA_PEEL} strokeWidth={2.2} />
    </svg>
  )
})

export const DrumstickFillIcon = forwardRef<SVGSVGElement, IconProps>(function DrumstickFillIcon(props, ref) {
  return (
    <svg ref={ref} {...svgProps(props)}>
      <path d={DRUMSTICK_MEAT} fill="currentColor" strokeWidth={1.5} />
      <path d={DRUMSTICK_BONE} strokeWidth={2.4} />
    </svg>
  )
})
