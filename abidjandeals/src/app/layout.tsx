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

const BASE_URL = 'https://abidjandeals-v3.vercel.app'

export const viewport: Viewport = {
  themeColor: '#F5620F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "AbidjanDeals – Marketplace N°1 de Côte d'Ivoire",
    template: '%s | AbidjanDeals',
  },
  description:
    "Achetez et vendez en toute sécurité à Abidjan, Bouaké, Yamoussoukro et partout en Côte d'Ivoire. Des milliers d'annonces vérifiées.",
  keywords: [
    "marketplace côte d'ivoire",
    'annonces abidjan',
    'vente achat ci',
    'immobilier ci',
    'petites annonces abidjan',
    "achat vente côte d'ivoire",
  ],

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    title: "AbidjanDeals – Marketplace Côte d'Ivoire 🇨🇮",
    description:
      "Des milliers d'annonces vérifiées. Achetez et vendez en toute sécurité à Abidjan et partout en CI.",
    url: BASE_URL,
    siteName: 'AbidjanDeals',
    type: 'website',
    locale: 'fr_CI',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: "AbidjanDeals – Marketplace N°1 de Côte d'Ivoire",
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: "AbidjanDeals – Marketplace Côte d'Ivoire 🇨🇮",
    description:
      "Des milliers d'annonces vérifiées. Achetez et vendez en toute sécurité.",
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