import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const runtime = 'edge';
export const alt = `${SITE_NAME} - Nutrition & Food Database API`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
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
          Nutrition API
        </div>
        <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.1, maxWidth: 900 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 32, marginTop: 32, color: '#52525b', maxWidth: 800 }}>
          Food search, barcode lookup, and verified macros for health apps
        </div>
      </div>
    ),
    { ...size }
  );
}
