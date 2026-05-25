import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const BASE_URL = 'https://Kivoo-v3.vercel.app'

export const viewport: Viewport = {
  themeColor: '#F5620F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Kivoo â€“ Marketplace NÂ°1 de CÃ´te d'Ivoire",
    template: '%s | Kivoo',
  },
  description:
    "Achetez et vendez en toute sÃ©curitÃ© Ã  Abidjan, BouakÃ©, Yamoussoukro et partout en CÃ´te d'Ivoire. Des milliers d'annonces vÃ©rifiÃ©es.",
  keywords: [
    "marketplace cÃ´te d'ivoire",
    'annonces abidjan',
    'vente achat ci',
    'immobilier ci',
    'petites annonces abidjan',
    "achat vente cÃ´te d'ivoire",
  ],

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    title: "Kivoo â€“ Marketplace CÃ´te d'Ivoire ðŸ‡¨ðŸ‡®",
    description:
      "Des milliers d'annonces vÃ©rifiÃ©es. Achetez et vendez en toute sÃ©curitÃ© Ã  Abidjan et partout en CI.",
    url: BASE_URL,
    siteName: 'Kivoo',
    type: 'website',
    locale: 'fr_CI',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: "Kivoo â€“ Marketplace NÂ°1 de CÃ´te d'Ivoire",
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: "Kivoo â€“ Marketplace CÃ´te d'Ivoire ðŸ‡¨ðŸ‡®",
    description:
      "Des milliers d'annonces vÃ©rifiÃ©es. Achetez et vendez en toute sÃ©curitÃ©.",
    images: ['/og-default.png'],
  },

  manifest: '/manifest.json',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <body
        className={`${syne.variable} ${dmSans.variable} font-body bg-gray-50 text-dark antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
