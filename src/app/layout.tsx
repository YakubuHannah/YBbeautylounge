import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'YBBeautylounge',
  description: 'Premium wig brand - Wig Revamp & Restoration',
  robots: {
    index: process.env.NODE_ENV === 'production',
    follow: true
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="preload"
          href="/fonts/instrument-serif-vf-var.css"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-vanilla-100 text-ink antialiased">
        {children}
      </body>
    </html>
  )
}