'use client'

import { useState } from 'react'

import type { PublicImage } from '@/lib/products'

export function ProductGallery({ images, name }: { images: PublicImage[]; name: string }) {
  const [current, setCurrent] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const image = images[current]

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => image && setZoomed(true)}
        className="block w-full cursor-zoom-in"
        aria-label="Zoom image"
      >
        <div className="aspect-square overflow-hidden bg-vanilla-50">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={image.alt_text || name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`aspect-square overflow-hidden bg-vanilla-50 ${
                i === current ? 'ring-2 ring-cherry-600' : ''
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt_text || name}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {zoomed && image && (
        <button
          type="button"
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-ink/90 p-4"
          aria-label="Close zoom"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.alt_text || name}
            className="max-h-full max-w-full object-contain"
          />
        </button>
      )}
    </div>
  )
}
