import Link from 'next/link'

import { whatsAppUrl } from '@/lib/whatsapp'

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-violet-800 text-vanilla-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3 md:px-12">
        <div>
          <p className="font-display text-2xl">YBBEAUTYLOUNGE</p>
          <p className="mt-3 max-w-xs text-sm text-violet-200">
            Premium wigs and thoughtful restoration. Calm, considered hair.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="text-vanilla-50 no-underline hover:underline">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/restoration" className="text-vanilla-50 no-underline hover:underline">
                Restoration
              </Link>
            </li>
            <li>
              <Link href="/length-guide" className="text-vanilla-50 no-underline hover:underline">
                Length guide
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-vanilla-50 no-underline hover:underline">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">Help</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/faq" className="text-vanilla-50 no-underline hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-vanilla-50 no-underline hover:underline">
                Track order
              </Link>
            </li>
            <li>
              <Link href="/policies/returns" className="text-vanilla-50 no-underline hover:underline">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy" className="text-vanilla-50 no-underline hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <a
                href={whatsAppUrl('Hi YBBeautylounge, I have a question.')}
                className="text-vanilla-50 no-underline hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-vanilla-400/30 px-5 py-4 text-center text-xs text-violet-200 md:px-12">
        © {new Date().getFullYear()} YBBeautylounge · Wig revamp & restoration
      </div>
    </footer>
  )
}
