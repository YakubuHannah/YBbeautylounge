export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">About</p>
      <h1 className="mt-2 font-display text-4xl text-ink">The Crown Is Real</h1>
      <div className="mt-8 space-y-5 text-ink-muted">
        <p>
          She walks with the quiet strength of a queen. The crown of a woman is her hair — 
          not just strands, but heritage, identity, and artistry woven into every curl. 
          What a honour to be made as a woman.
        </p>
        <p>
          The beauty is in the style that carries her. Whether it's the sleek elegance of a silk press, 
          the wild crown of natural coils, or the voluminous drama of a protected style — each choice 
          is a celebration of the woman who wears it.
        </p>
        <p>
          YBBeautylounge exists to honor that sacred space between a woman and her crown. 
          Every piece is chosen with the same reverence one gives to a treasured heirloom. 
          Because when you honor the crown, you honor the queen.
        </p>
      </div>
    </main>
  )
}