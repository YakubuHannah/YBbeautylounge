'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

type Variant = {
  id?: string
  sku: string
  length_inches: string
  colorway: string
  density_percent: string
  draw_type: string
  price_naira: string
  cost_price_naira: string
  stock_quantity: string
  weight_grams: string
  is_active: boolean
}

type MediaAsset = { id: string; url: string; filename: string; mime_type: string; alt_text: string | null }

type ProductImage = {
  id: string
  media_asset: MediaAsset
  sort_order: number
  display_name: string | null
  alt_text: string | null
}

function Field({
  label,
  help,
  children,
}: {
  label: string
  help?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {help && <span className="block text-xs text-ink-muted">{help}</span>}
      <div className="mt-1">{children}</div>
    </label>
  )
}

const inputClass =
  'h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink'

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [texture, setTexture] = useState('')
  const [status, setStatus] = useState('draft')
  const [featured, setFeatured] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [imageMetadata, setImageMetadata] = useState<Record<string, { display_name: string; alt_text: string }>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [pRes, mRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch('/api/admin/media'),
      ])
      const pData = await pRes.json()
      const mData = await mRes.json()
      if (!pRes.ok) {
        setError(pData.error || 'Failed to load')
        setLoading(false)
        return
      }
      const p = pData.product
      setName(p.name)
      setDescription(p.description || '')
      setTexture(p.texture || '')
      setStatus(p.status)
      setFeatured(p.featured)
      setVariants(
        p.variants.map(
          (v: {
            id: string
            sku: string
            length_inches: number | null
            colorway: string | null
            density_percent: number | null
            draw_type: string | null
            price: number
            cost_price: number | null
            stock_quantity: number
            weight_grams: number | null
            is_active: boolean
          }) => ({
            id: v.id,
            sku: v.sku,
            length_inches: v.length_inches?.toString() ?? '',
            colorway: v.colorway ?? '',
            density_percent: v.density_percent?.toString() ?? '',
            draw_type: v.draw_type ?? '',
            price_naira: Math.round(v.price / 100).toString(),
            cost_price_naira:
              v.cost_price != null ? Math.round(v.cost_price / 100).toString() : '',
            stock_quantity: v.stock_quantity.toString(),
            weight_grams: v.weight_grams?.toString() ?? '',
            is_active: v.is_active,
          })
        )
      )
      setSelectedMedia(
        (p.images || []).map((img: { media_asset_id: string }) => img.media_asset_id)
      )
      setMedia(mData.assets || [])
      const meta: Record<string, { display_name: string; alt_text: string }> = {}
      ;(p.images || []).forEach((img: ProductImage) => {
        meta[img.media_asset.id] = {
          display_name: img.display_name || '',
          alt_text: img.alt_text || '',
        }
      })
      setImageMetadata(meta)
      setLoading(false)
    }
    load()
  }, [id])

  function updateVariant(i: number, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  }

  function updateImageMetadata(imageId: string, field: 'display_name' | 'alt_text', value: string) {
    setImageMetadata((prev) => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        [field]: value,
      },
    }))
  }

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        texture,
        status,
        featured,
        images: selectedMedia.map((assetId) => ({
          media_asset_id: assetId,
          display_name: imageMetadata[assetId]?.display_name || '',
          alt_text: imageMetadata[assetId]?.alt_text || '',
        })),
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku || `SKU-${Date.now().toString(36)}`,
          length_inches: v.length_inches === '' ? null : Number(v.length_inches),
          colorway: v.colorway || null,
          density_percent: v.density_percent === '' ? null : Number(v.density_percent),
          draw_type: v.draw_type || null,
          price_naira: Number(v.price_naira || 0),
          cost_price_naira: v.cost_price_naira === '' ? null : Number(v.cost_price_naira),
          stock_quantity: Number(v.stock_quantity || 0),
          weight_grams: v.weight_grams === '' ? null : Number(v.weight_grams),
          is_active: v.is_active,
        })),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setMessage('Saved. Taking you back to all products…')
    router.push('/admin/products?saved=1')
    router.refresh()
  }

  function toggleMedia(mid: string) {
    setSelectedMedia((prev) =>
      prev.includes(mid) ? prev.filter((x) => x !== mid) : [...prev, mid]
    )
    setImageMetadata((prev) => {
      if (prev[mid]) return prev
      const asset = media.find((m) => m.id === mid)
      return { ...prev, [mid]: { display_name: '', alt_text: asset?.alt_text || '' } }
    })
  }

  if (loading) return <p className="text-ink-muted">Loading product…</p>

  const missingAltCount = selectedMedia.filter(
    (mid) => !imageMetadata[mid]?.alt_text?.trim()
  ).length

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/products" className="text-sm text-cherry-600">
            ← All products
          </Link>
          <h1 className="mt-2 font-display text-3xl text-ink">Edit product</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Update prices, stock, and which photos appear on the shop.
          </p>
        </div>
        <Button type="button" variant="primary" loading={saving} onClick={save}>
          Save changes
        </Button>
      </div>

      {message && (
        <p className="rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-4 py-3 text-sm text-ink">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-[2px] border border-cherry-200 bg-cherry-50 px-4 py-3 text-sm text-cherry-700">
          {error}
        </p>
      )}

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
        <h2 className="font-display text-xl">About this product</h2>
        <Field label="Product name" help="Shown on the shop and product page.">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Description" help="Customer-facing details.">
          <textarea
            className={`${inputClass} h-28 py-3`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texture" help="Main filter customers use.">
            <input className={inputClass} value={texture} onChange={(e) => setTexture(e.target.value)} />
          </Field>
          <Field label="Status" help="Draft is hidden. Active is live.">
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Feature on homepage
        </label>
        {missingAltCount > 0 && (
          <p className="text-sm text-ink-muted">
            {missingAltCount} photo{missingAltCount > 1 ? 's' : ''} without alt text — a
            description is auto-generated on save.
          </p>
        )}
      </section>

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Sizes & prices</h2>
            <p className="text-xs text-ink-muted">
              Sell price & stock are per option. Cost is private (admin only).
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                {
                  sku: '',
                  length_inches: '',
                  colorway: '',
                  density_percent: '',
                  draw_type: '',
                  price_naira: '',
                  cost_price_naira: '',
                  stock_quantity: '',
                  weight_grams: '',
                  is_active: true,
                },
              ])
            }
          >
            Add option
          </Button>
        </div>

        {variants.map((v, i) => (
          <div key={v.id || i} className="space-y-3 border border-vanilla-400 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-800">
              Option {i + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="SKU">
                <input className={inputClass} value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} />
              </Field>
              <Field label="Length (inches)" help="e.g. 16, 18, 20">
                <input
                  type="number"
                  className={inputClass}
                  value={v.length_inches}
                  onChange={(e) => updateVariant(i, { length_inches: e.target.value })}
                />
              </Field>
              <Field label="Colour">
                <input
                  className={inputClass}
                  value={v.colorway}
                  onChange={(e) => updateVariant(i, { colorway: e.target.value })}
                />
              </Field>
              <Field label="Sell price (₦)" help="Customer price, e.g. 185000">
                <input
                  type="number"
                  className={inputClass}
                  value={v.price_naira}
                  onChange={(e) => updateVariant(i, { price_naira: e.target.value })}
                />
              </Field>
              <Field label="Your cost (₦)" help="Private — not shown on shop">
                <input
                  type="number"
                  className={inputClass}
                  value={v.cost_price_naira}
                  onChange={(e) => updateVariant(i, { cost_price_naira: e.target.value })}
                />
              </Field>
              <Field label="Stock available" help="How many of this option you have">
                <input
                  type="number"
                  className={inputClass}
                  value={v.stock_quantity}
                  onChange={(e) => updateVariant(i, { stock_quantity: e.target.value })}
                />
              </Field>
              <Field label="Density (%)">
                <input
                  type="number"
                  className={inputClass}
                  value={v.density_percent}
                  onChange={(e) => updateVariant(i, { density_percent: e.target.value })}
                />
              </Field>
              <Field label="Weight (g)">
                <input
                  type="number"
                  className={inputClass}
                  value={v.weight_grams}
                  onChange={(e) => updateVariant(i, { weight_grams: e.target.value })}
                />
              </Field>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
        <div>
          <h2 className="font-display text-xl">Product photos</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Click images to select. Selected photos show a red border and appear on the shop in this
            order. Upload new ones under Media first.
          </p>
          <Link href="/admin/media" className="mt-2 inline-block text-sm font-semibold text-cherry-600">
            Open media library →
          </Link>
        </div>

        {media.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No images yet. Go to Media, upload or paste a URL, then come back here.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {media.map((m) => {
              const on = selectedMedia.includes(m.id)
              const order = on ? selectedMedia.indexOf(m.id) + 1 : null
              return (
                <div key={m.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleMedia(m.id)}
                    className={`relative overflow-hidden border-2 bg-vanilla-50 text-left w-full ${
                      on ? 'border-cherry-600' : 'border-vanilla-400'
                    }`}
                  >
                    {m.mime_type.startsWith('video/') ? (
                      <video src={m.url} className="aspect-[4/5] w-full object-cover" controls />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={m.url} alt={m.filename} className="aspect-[4/5] w-full object-cover" />
                    )}
                    <span className="block truncate px-2 py-2 text-xs text-ink-muted">
                      {on ? `Selected · #${order}` : 'Tap to attach'}
                    </span>
                  </button>
                  {on && (
                    <div className="space-y-2 px-2">
                      <Field label="Display name">
                        <input
                          className={inputClass}
                          value={imageMetadata[m.id]?.display_name || ''}
                          onChange={(e) => updateImageMetadata(m.id, 'display_name', e.target.value)}
                          placeholder="e.g. bone-straight-signature-22in"
                        />
                      </Field>
                      <Field label="Alt text" help="Describes the photo for accessibility and SEO. Saved with the product.">
                        <input
                          className={inputClass}
                          value={imageMetadata[m.id]?.alt_text || ''}
                          onChange={(e) => updateImageMetadata(m.id, 'alt_text', e.target.value)}
                          placeholder="Leave blank to auto-generate"
                        />
                      </Field>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <Button type="button" variant="primary" className="h-12 w-full" loading={saving} onClick={save}>
        Save changes
      </Button>
    </div>
  )
}