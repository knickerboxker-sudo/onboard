import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#f5f2eb',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 80, fontStyle: 'italic', color: '#0d0d0d' }}>Sortir</div>
        <div style={{ fontSize: 32, color: '#666', marginTop: 24, textAlign: 'center' }}>
          Connect with businesses that send you customers
        </div>
        <div style={{ fontSize: 20, color: '#c8622a', marginTop: 16 }}>Free, always.</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
