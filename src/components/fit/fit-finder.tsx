'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

type Recommendation = {
  slug: string
  name: string
  texture: string
  image: { url: string; alt_text: string | null; focal_x: number; focal_y: number } | null
  reason: string
}

type FitResult = {
  face_shape: string
  summary: string
  recommendations: Recommendation[]
}

const MAX_EDGE = 1024

async function toJpeg(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Could not read that photo.'))
      el.src = url
    })
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not read that photo.'))),
        'image/jpeg',
        0.85
      )
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function FitFinder() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<FitResult | null>(null)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
    setResult(null)
    setError('')
  }

  async function analyse() {
    if (!file) {
      setError('Add a photo of your face first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const jpeg = await toJpeg(file)
      const form = new FormData()
      form.append('photo', jpeg, 'photo.jpg')
      const res = await fetch('/api/fit', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong — please try again.')
        return
      }
      setResult(data)
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 max-w-2xl">
      {!result && (
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={onPick}
            className="block w-full text-sm"
            aria-label="Photo of your face"
          />
          {preview && (
            <div className="h-48 w-48 overflow-hidden rounded-[2px] border border-vanilla-400 bg-vanilla-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview of your upload" className="h-full w-full object-cover" />
            </div>
          )}
          <p className="text-xs text-ink-muted">
            Your photo is sent to our AI stylist (powered by OpenAI) to read your face shape. It is
            used only for this suggestion and is never saved by YBBeautylounge.
          </p>
          {error && <p className="text-sm text-cherry-700">{error}</p>}
          <Button
            type="button"
            variant="secondary"
            className="h-12 px-8"
            loading={loading}
            onClick={analyse}
          >
            {loading ? 'Studying your features…' : 'Find my fit'}
          </Button>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
              {result.face_shape}
            </p>
            <p className="mt-3 text-lg leading-relaxed text-ink-muted">{result.summary}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {result.recommendations.map((rec) => (
              <Link
                key={rec.slug}
                href={`/shop/${rec.slug}`}
                className="group block no-underline hover:no-underline"
              >
                <div className="aspect-square overflow-hidden bg-vanilla-50">
                  {rec.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rec.image.url}
                      alt={rec.image.alt_text || rec.name}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: `${rec.image.focal_x}% ${rec.image.focal_y}%` }}
                    />
                  )}
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-violet-800">
                  {rec.texture}
                </p>
                <h3 className="font-display text-lg text-ink group-hover:text-cherry-700">
                  {rec.name}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{rec.reason}</p>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setResult(null)
              setFile(null)
              setPreview(null)
            }}
            className="text-sm font-semibold text-cherry-600"
          >
            Try another photo
          </button>
        </div>
      )}
    </div>
  )
}
