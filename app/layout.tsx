import type { Metadata } from 'next'
import { Heebo, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const heebo = Heebo({ 
  subsets: ["hebrew", "latin"],
  variable: '--font-heebo',
  weight: ['400', '700', '900']
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  weight: ['400', '700', '900']
});

export const metadata: Metadata = {
  title: 'Verifone Check Price - מחירון חלפים חכם',
  description: 'מערכת חכמה לניהול מחירון חלקי חילוף למסופים וקופות',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className="bg-background">
      <body className={`${heebo.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
