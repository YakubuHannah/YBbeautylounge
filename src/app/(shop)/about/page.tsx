export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">About</p>
      
      <h1 className="mt-2 font-display text-4xl text-ink">The crown is not a metaphor</h1>
      
      <div className="mt-8 space-y-8 text-ink-muted">
        <section>
          <p className="text-lg leading-relaxed">
            She walks with the quiet strength of a queen.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            There is a way a woman walks when her hair is right. You have seen it. She is not performing anything. She has stopped thinking about it, and everything else in her comes forward.
          </p>
          <p className="mt-4 text-lg leading-relaxed italic">
            The crown of a woman is her hair. Not just strands, but heritage, identity, and artistry woven into every curl.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            What an honour to be made as a woman.
          </p>
        </section>

        <section className="border-t border-vanilla-400 pt-12">
          <h2 className="font-display text-2xl text-ink">What we make</h2>
          <p className="mt-4 text-lg leading-relaxed">
            At YBBeautylounge, it is never just business as usual.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            We refine the beauty of every woman through carefully crafted, customised human hair wigs designed to celebrate individuality.
          </p>
          
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="aspect-[4/5] overflow-hidden border border-vanilla-400 bg-vanilla-50">
                <img 
                  src="/images/bone-straight-demo.jpg" 
                  alt="Bone straight wig styling demo"
                  className="w-full object-cover"
                />
              </div>
              <p className="text-sm text-ink-muted">
                The sleek elegance of a bone straight fall
              </p>
            </div>
            <div className="space-y-4">
              <div className="aspect-[4/5] overflow-hidden border border-vanilla-400 bg-vanilla-50">
                <img 
                  src="/images/voluminous-curl-demo.jpg" 
                  alt="Voluminous curl wig styling demo"
                  className="w-full object-cover"
                />
              </div>
              <p className="text-sm text-ink-muted">
                The sharp line of a bob or voluminous drama of a full curl
              </p>
            </div>
          </div>
          
          <p className="mt-6 text-lg leading-relaxed">
            The beauty is in the style that carries her. Whether it is the sleek elegance of a bone straight fall, the sharp line of a bob, or the voluminous drama of a full curl, each choice is a celebration of the woman who wears it.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            With every wig we create more than a look. We create comfort, confidence, and a signature style that fits seamlessly into your life.
          </p>
        </section>

        <section className="border-t border-vanilla-400 pt-12">
          <h2 className="font-display text-2xl text-ink">The woman this is for</h2>
          <p className="mt-4 text-lg leading-relaxed">
            The YBBeautylounge woman is ever evolving. Beautiful, warm, graceful, yet strong, intelligent and confident.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            She embraces her unique personality while radiating elegance.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            Each choice she makes is a decision she made about herself, and it deserves to be treated as one.
          </p>
        </section>

        <section className="border-t border-vanilla-400 pt-12">
          <h2 className="font-display text-2xl text-ink">Nothing here is disposable</h2>
          <p className="mt-4 text-lg leading-relaxed">
            YBBeautylounge exists to honour that sacred space between a woman and her crown.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            Every piece is chosen with the same reverence one gives to a treasured heirloom. For what it will still be worth in three years, not for how it looks in the first week.
          </p>
          <p className="mt-4 text-lg leading-relaxed italic text-cherry-600">
            Because when you honor the crown, you honor the queen.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            She was already wearing it.
          </p>
        </section>
      </div>

      <div className="mt-12 flex gap-4">
        <a 
          href="/shop" 
          className="rounded-[2px] border border-cherry-600 bg-cherry-600 px-6 py-3 text-sm font-semibold text-vanilla-50 transition-colors hover:bg-transparent"
        >
          Shop the collection
        </a>
        <a 
          href="/restoration" 
          className="rounded-[2px] border border-ink bg-vanilla-50 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-vanilla-100"
        >
          Restore a unit
        </a>
      </div>
    </main>
  )
}