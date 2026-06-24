export const dynamic = 'force-dynamic';

import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/AppContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Meliza Lounge — Premium Nail Artistry',
  description:
    'Experience luxury nail care at The Meliza Lounge. Expert gel, acrylic, and nail art services. Book your appointment today.',
  keywords: ['nail salon', 'nail art', 'gel manicure', 'acrylic nails', 'Meliza Lounge'],
  openGraph: {
    title: 'The Meliza Lounge',
    description: 'Premium nail artistry, beauty & luxury.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#E91E8C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${dancingScript.variable}`}>
      <body className="font-[var(--font-inter)] antialiased">
        <AppProvider>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'font-[var(--font-inter)] text-sm',
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
