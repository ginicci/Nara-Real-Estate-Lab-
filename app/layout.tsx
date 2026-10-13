import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Instrument_Serif } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400' })

export const metadata: Metadata = {
  title: 'Nara Real Estate Lab — Buy, sell and rent with a local team',
  description:
    'Nara Real Estate Lab helps you buy, sell and rent homes. Join the early-access list, set search alerts, or talk to an agent.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1b2a24',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
