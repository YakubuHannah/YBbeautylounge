export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">About</p>
      <h1 className="mt-2 font-display text-4xl text-ink">For the woman who knows her worth</h1>
      <div className="mt-8 space-y-5 text-ink-muted">
        <p>
          This started in a kitchen table, late nights, and a lot of late-night WhatsApp messages. 
          I was tired of guessing games with hair - the photos that didn't show the true texture, 
          the prices that felt off, the trust that was hard to build. So I built something different.
        </p>
        <p>
          Every piece here is chosen by someone who knows that hair is more than fabric - it's 
          identity, it's confidence, it's the quiet power of a woman who knows exactly what 
          she wants and isn't afraid to ask for it. The crown is real. The style is hers. 
          And the care? That's in everything we do.
        </p>
        <p>
          You deserve hair that respects your journey, your texture, your lifestyle. 
          And you deserve a space where that's not just promised - it's proven, 
          tracked, and backed by reviews from women who've walked this path.
        </p>
      </div>
    </main>
  )
}