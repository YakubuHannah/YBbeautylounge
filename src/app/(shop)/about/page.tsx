'use client'

import { useEffect, useState } from 'react'

type MediaAsset = {
  id: string
  url: string
  filename: string
  mime_type: string
  alt_text: string | null
  focal_x: number
  focal_y: number
}

export default function AboutPage() {
  const [images, setImages] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/media')
        const data = await res.json()
        const allAssets = data.assets || []
        const imageAssets = allAssets.filter((a: MediaAsset) => a.mime_type.startsWith('image/'))
        setImages(imageAssets.slice(0, 2))
      } catch (e) {
        console.error('Failed to load images', e)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-12 md:py-24">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">About</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-6xl">
          She Wears the Crown
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-muted md:text-xl">
          She walks with the quiet strength of a queen.
        </p>
      </header>

      <section className="mt-16 grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="space-y-5 text-ink-muted md:col-span-6">
          <p className="text-lg leading-relaxed">
            There is a way a woman walks when her hair is right. You have seen it. She is not performing anything. She has stopped thinking about it, and everything else in her comes forward.
          </p>
          <p className="font-display text-2xl leading-snug text-cherry-600">
            The crown of a woman is her hair. Not just strands, but heritage, identity, and artistry woven into every curl.
          </p>
          <p className="text-lg leading-relaxed">
            What an honour to be made as a woman.
          </p>
        </div>
        {!loading && images[0] && (
          <figure className="md:col-span-4 md:col-start-9">
            <div className="aspect-[4/5] overflow-hidden bg-vanilla-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0].url}
                alt={images[0].alt_text || images[0].filename}
                className="h-full w-full object-cover"
                style={{ objectPosition: `${images[0].focal_x}% ${images[0].focal_y}%` }}
              />
            </div>
          </figure>
        )}
      </section>

      <section className="mt-20 max-w-xl text-ink-muted md:ml-[25%]">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          What we make
        </p>
        <p className="mt-5 text-lg leading-relaxed">
          At YBBeautylounge, it is never just business as usual.
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          We refine the beauty of every woman through carefully crafted, customised human hair wigs designed to celebrate individuality.
        </p>
      </section>

      <section className="mt-20 grid items-start gap-10 md:grid-cols-12 md:gap-8">
        {!loading && images[1] && (
          <figure className="order-last md:order-first md:col-span-4">
            <div className="aspect-[4/5] overflow-hidden bg-vanilla-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[1].url}
                alt={images[1].alt_text || images[1].filename}
                className="h-full w-full object-cover"
                style={{ objectPosition: `${images[1].focal_x}% ${images[1].focal_y}%` }}
              />
            </div>
          </figure>
        )}
        <div className="space-y-5 text-ink-muted md:col-span-6 md:col-start-6 md:pt-12">
          <p className="text-lg leading-relaxed">
            The beauty is in the style that carries her. Whether it is the sleek elegance of a bone straight fall, the sharp line of a bob, or the voluminous drama of a full curl, each choice is a celebration of the woman who wears it.
          </p>
          <p className="text-lg leading-relaxed">
            With every wig we create more than a look. We create comfort, confidence, and a signature style that fits seamlessly into your life.
          </p>
        </div>
      </section>

      <section className="mt-20 max-w-xl text-ink-muted">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          The woman this is for
        </p>
        <p className="mt-5 text-lg leading-relaxed">
          The YBBeautylounge woman is ever evolving. Beautiful, warm, graceful, yet strong, intelligent and confident.
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          She embraces her unique personality while radiating elegance.
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          Each choice she makes is a decision she made about herself, and it deserves to be treated as one.
        </p>
      </section>

      <section className="mt-20 max-w-xl text-ink-muted md:ml-[25%]">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          Nothing here is disposable
        </p>
        <p className="mt-5 text-lg leading-relaxed">
          YBBeautylounge exists to honour that sacred space between a woman and her crown.
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          Every piece is chosen with the same reverence one gives to a treasured heirloom. For what it will still be worth in three years, not for how it looks in the first week.
        </p>
      </section>

      <section className="mx-auto mt-24 max-w-2xl text-center">
        <p className="font-display text-3xl leading-snug text-cherry-600 md:text-4xl">
          Because when you honor the crown, you honor the queen.
        </p>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-ink">
          She was already wearing it
        </p>
      </section>

      <div className="mt-16 flex gap-4 justify-center">
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