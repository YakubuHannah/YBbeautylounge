import './globals.css'
import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '600'],
})

const serif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: '400',
})

export const metadata: Metadata = {
  title: {
    default: 'YBBeautylounge',
    template: '%s · YBBeautylounge',
  },
  description: 'Premium wigs and wig restoration. Mobile-first shopping for Nigeria.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-vanilla-100 font-body text-ink antialiased">{children}</body>
    </html>
  )
}
