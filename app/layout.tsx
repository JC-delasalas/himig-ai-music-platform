import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ErrorBoundary>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </ErrorBoundary>
        <Toaster />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Setup global error handler
              (function() {
                const suppressedPatterns = [
                  'Extension context invalidated',
                  'polyfill.js',
                  'knock.app',
                  'chrome-extension://',
                  'moz-extension://',
                  'safari-extension://'
                ];

                window.addEventListener('error', function(e) {
                  const shouldSuppress = suppressedPatterns.some(pattern =>
                    e.message.toLowerCase().includes(pattern.toLowerCase()) ||
                    (e.filename && e.filename.includes(pattern))
                  );
                  if (shouldSuppress) {
                    e.preventDefault();
                    return false;
                  }
                });

                window.addEventListener('unhandledrejection', function(e) {
                  const message = e.reason?.toString() || '';
                  const shouldSuppress = suppressedPatterns.some(pattern =>
                    message.toLowerCase().includes(pattern.toLowerCase())
                  );
                  if (shouldSuppress) {
                    e.preventDefault();
                    return false;
                  }
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
