import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Monelixa - Dijital Ürün Satış Platformu',
    template: '%s | Monelixa',
  },
  description:
    'Dijital ürünlerinizi ve aboneliklerinizi kolayca satın. Stripe ve PayTR entegrasyonu ile güvenli ödeme.',
  keywords: ['dijital ürün', 'abonelik', 'e-ticaret', 'stripe', 'paytr', 'saas'],
  authors: [{ name: 'Monelixa' }],
  creator: 'Monelixa',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://monelixa.com',
    siteName: 'Monelixa',
    title: 'Monelixa - Dijital Ürün Satış Platformu',
    description: 'Dijital ürünlerinizi ve aboneliklerinizi kolayca satın.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Monelixa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monelixa - Dijital Ürün Satış Platformu',
    description: 'Dijital ürünlerinizi ve aboneliklerinizi kolayca satın.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} bg-dark-950 text-white antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
