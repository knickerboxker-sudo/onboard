import './globals.css';

export const metadata = {
  title: 'Trading Copilot',
  description: 'AI-powered trading journal and copilot',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trading Copilot',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0f0f0f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-trade-bg font-sans text-trade-text antialiased">{children}</body>
    </html>
  );
}
