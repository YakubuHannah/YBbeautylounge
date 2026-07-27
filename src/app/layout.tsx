import './globals.css'
import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import { CartProvider } from '@/components/cart/cart-provider'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { WhatsAppFloat } from '@/components/layout/whatsapp-float'

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
      <body className="flex min-h-screen flex-col bg-vanilla-100 font-body text-ink antialiased">
        <CartProvider>
          <AnnouncementBar />
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  )
}
