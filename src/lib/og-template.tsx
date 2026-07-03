import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/site'

export const OG_SIZE = { width: 1200, height: 630 }

/**
 * Shared Open Graph card: brand gradient, section label, page title, subtitle.
 * Used by per-route opengraph-image files so every template family gets a unique card.
 */
export function buildOgImage({
  label,
  title,
  subtitle,
}: {
  label: string
  title: string
  subtitle?: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(160deg, #f8fafc 0%, #ffffff 45%, #e8fbfd 100%)',
          color: '#1e1e1e',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#0891a3',
            marginBottom: 24,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: title.length > 40 ? 56 : 68,
            fontWeight: 600,
            lineHeight: 1.1,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 30, marginTop: 28, color: '#52525b', maxWidth: 900 }}>
            {subtitle}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 80,
            fontSize: 26,
            color: '#0891a3',
            fontWeight: 600,
          }}
        >
          {SITE_NAME}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  )
}
