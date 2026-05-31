import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ColdSealProvider } from '@/hooks/useColdSeal'
import { TopBar } from '@/components/TopBar'
import { Sidebar } from '@/components/Sidebar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
})

export const metadata: Metadata = {
  title: 'COLD-SEAL | Live Monitor',
  description:
    'COLD-SEAL is a real-time vaccine cold-chain monitoring system with IoT telemetry and blockchain integrity auditing.',
  keywords: ['cold chain', 'vaccine', 'iot', 'blockchain', 'monitoring', 'dashboard'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#0A0A0F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-cold-bg text-cold-text">
        <ColdSealProvider>
          <div className="min-h-screen">
            <TopBar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 min-h-screen pt-[60px] md:pl-[220px] px-6 pb-10">
                <div className="relative z-10 max-w-[1400px] mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ColdSealProvider>
      </body>
    </html>
  )
}
