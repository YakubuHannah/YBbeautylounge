import { whatsAppUrl } from '@/lib/whatsapp'

export function WhatsAppFloat() {
  return (
    <a
      href={whatsAppUrl('Hi YBBeautylounge — I’d like to ask about a wig.')}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-12 items-center rounded-[2px] border border-ink bg-vanilla-50 px-5 text-sm font-medium text-ink no-underline shadow-none hover:bg-vanilla-100 hover:no-underline md:bottom-8 md:right-8"
      aria-label="Chat on WhatsApp"
    >
      WhatsApp
    </a>
  )
}
