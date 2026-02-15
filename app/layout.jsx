import './globals.css';

export const metadata = {
  title: 'Trading Copilot',
  description: 'AI-powered trading journal and copilot',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-trade-bg font-sans text-trade-text antialiased">{children}</body>
    </html>
  );
}
