import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'PharmaTrace | Product Tracking Dashboard',
  description:
    'Professional B2B Supply Chain Management Dashboard with real-time product tracking, blockchain verification, and quality assurance.',
  keywords: [
    'product tracking',
    'supply chain',
    'blockchain',
    'monitoring',
    'dashboard',
    'pharmaceutical',
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#f4f6f9',
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
