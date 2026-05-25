import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ColdChain Monitor | Vaccine Cold Chain IoT-Blockchain',
  description:
    'Next-Gen IoT-Blockchain Vaccine Cold Chain Monitoring Dashboard with real-time data streaming, anomaly detection, and ledger auditing.',
  keywords: [
    'vaccine',
    'cold chain',
    'IoT',
    'blockchain',
    'monitoring',
    'dashboard',
    'real-time',
  ],
  viewport: 'width=device-width, initial-scale=1.0',
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
