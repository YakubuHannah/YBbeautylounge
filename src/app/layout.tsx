import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YBBeautylounge',
  description: 'Premium wigs · Wig revamp & restoration',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen bg-vanilla-100 text-ink antialiased">{children}</body>
    </html>
  )
}
