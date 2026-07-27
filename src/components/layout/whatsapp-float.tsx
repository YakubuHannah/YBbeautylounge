import { whatsAppUrl } from '@/lib/whatsapp'

export function WhatsAppFloat() {
  return (
    <a
      href={whatsAppUrl('Hi YBBeautylounge — I’d like to ask about a wig.')}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 items-center rounded-full bg-cherry-600 px-5 text-sm font-semibold text-vanilla-50 no-underline shadow-none hover:bg-cherry-700 hover:no-underline md:bottom-8 md:right-8"
      aria-label="Chat on WhatsApp"
    >
      WhatsApp
    </a>
  )
}
