import Link from 'next/link'

/** Floating shortcut to the AI stylist — bottom-left, opposite the WhatsApp float. */
export function FitFloat() {
  return (
    <Link
      href="/find-my-fit"
      className="fixed bottom-5 left-5 z-40 flex h-14 items-center gap-2 rounded-full bg-violet-800 px-4 text-sm font-semibold text-vanilla-50 no-underline shadow-none hover:opacity-90 hover:no-underline sm:px-5 md:bottom-8 md:left-8"
      aria-label="Fit for your look — find the wig that suits your face"
    >
      <span aria-hidden className="text-xl">
        💇🏾‍♀️
      </span>
      <span className="hidden sm:inline">Fit for your look</span>
    </Link>
  )
}
