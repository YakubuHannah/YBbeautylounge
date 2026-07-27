import Link from 'next/link'

export function AnnouncementBar() {
  return (
    <div className="bg-violet-800 px-4 py-2 text-center text-xs text-vanilla-50">
      Free delivery from ₦200,000 ·{' '}
      <Link href="/shop" className="text-vanilla-50 underline">
        Shop the collection
      </Link>
    </div>
  )
}
