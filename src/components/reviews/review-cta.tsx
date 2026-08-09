import Link from 'next/link'

/** Small prompt to leave a review — used on track and installment pages. */
export function ReviewCta() {
  return (
    <div className="mt-10 border-t border-vanilla-400 pt-6">
      <p className="text-sm font-semibold text-ink">Loved your hair?</p>
      <p className="mt-1 text-sm text-ink-muted">
        Share your experience — it helps others choose with confidence.
      </p>
      <Link
        href="/reviews"
        className="mt-3 inline-flex h-11 items-center border border-ink px-5 text-sm font-semibold text-ink no-underline transition-colors hover:bg-ink hover:text-vanilla-50 hover:no-underline"
      >
        Leave a review
      </Link>
    </div>
  )
}
