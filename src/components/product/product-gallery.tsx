'use client'

import { useState } from 'react'

import type { PublicImage } from '@/lib/products'

const isVideo = (img: PublicImage) => img.mime_type.startsWith('video/')

function PlayBadge() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-vanilla-50">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
    </span>
  )
}

export function ProductGallery({ images, name }: { images: PublicImage[]; name: string }) {
  const [current, setCurrent] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const image = images[current]

  return (
    <div className="space-y-3">
      {image && isVideo(image) ? (
        <div className="aspect-[4/5] overflow-hidden bg-vanilla-50">
          <video
            key={image.id}
            src={image.url}
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => image && setZoomed(true)}
          className="block w-full cursor-zoom-in"
          aria-label="Zoom image"
        >
          <div className="aspect-[4/5] overflow-hidden bg-vanilla-50">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={image.alt_text || name}
                className="h-full w-full object-cover"
                style={{ objectPosition: `${image.focal_x}% ${image.focal_y}%` }}
              />
            ) : null}
          </div>
        </button>
      )}

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`relative aspect-[4/5] overflow-hidden bg-vanilla-50 ${
                i === current ? 'ring-2 ring-cherry-600' : ''
              }`}
              aria-label={`View ${isVideo(img) ? 'video' : 'image'} ${i + 1}`}
            >
              {isVideo(img) ? (
                <>
                  <video
                    src={img.url}
                    className="pointer-events-none h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <PlayBadge />
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt={img.alt_text || name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: `${img.focal_x}% ${img.focal_y}%` }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {zoomed && image && !isVideo(image) && (
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
