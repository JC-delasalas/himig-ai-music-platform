import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Himig - AI Music Generation Platform',
  description: 'Create professional-quality music from text prompts using advanced AI technology',
  keywords: 'AI music, music generation, artificial intelligence, audio creation, music production',
  authors: [{ name: 'Himig Team' }],
  openGraph: {
    title: 'Himig - AI Music Generation Platform',
    description: 'Create professional-quality music from text prompts using advanced AI technology',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Himig - AI Music Generation Platform',
    description: 'Create professional-quality music from text prompts using advanced AI technology',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-background text-foreground antialiased`}>
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
