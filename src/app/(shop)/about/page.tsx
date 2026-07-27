export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">About</p>
      <h1 className="mt-2 font-display text-4xl text-ink">A quieter way to buy hair</h1>
      <div className="mt-8 space-y-5 text-ink-muted">
        <p>
          YBBeautylounge started in WhatsApp threads and spreadsheets — one conversation at a time,
          one carefully chosen unit at a time.
        </p>
        <p>
          This space exists so you can see texture, length, density, lace, and care without
          guessing, and so restoring a piece you already love feels as considered as buying a new
          one.
        </p>
        <p>
          The bet is simple: a Nigerian customer who has never met the founder will still feel safe
          paying at this price. Everything here — reviews, tracking, attributes, policies — is
          built toward that trust.
        </p>
      </div>
    </main>
  )
}
