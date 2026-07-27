'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Variant = {
  id?: string
  sku: string
  length_inches: number | null
  colorway: string | null
  density_percent: number | null
  draw_type: string | null
  price_naira: number
  cost_price_naira: number | null
  stock_quantity: number
  weight_grams: number | null
  is_active: boolean
}

type Media = { id: string; url: string; filename: string }

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [texture, setTexture] = useState('bone_straight')
  const [status, setStatus] = useState('draft')
  const [featured, setFeatured] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [pRes, mRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch('/api/admin/media'),
      ])
      const pData = await pRes.json()
      const mData = await mRes.json()
      if (!pRes.ok) {
        setMessage(pData.error || 'Failed to load')
        return
      }
      const p = pData.product
      setName(p.name)
      setDescription(p.description || '')
      setTexture(p.texture)
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
            length_inches: v.length_inches,
            colorway: v.colorway,
            density_percent: v.density_percent,
            draw_type: v.draw_type,
            price_naira: Math.round(v.price / 100),
            cost_price_naira: v.cost_price != null ? Math.round(v.cost_price / 100) : null,
            stock_quantity: v.stock_quantity,
            weight_grams: v.weight_grams,
            is_active: v.is_active,
          })
        )
      )
      setSelectedMedia(
        (p.images || []).map((img: { media_asset_id: string }) => img.media_asset_id)
      )
      setMedia(mData.assets || [])
    }
    load()
  }, [id])

  async function save() {
    setSaving(true)
    setMessage('')
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        texture,
        status,
        featured,
        variants,
        media_asset_ids: selectedMedia,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setMessage(data.error || 'Save failed')
      return
    }
    setMessage('Saved')
    router.refresh()
  }

  function updateVariant(i: number, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        sku: `SKU-${Date.now().toString(36)}`,
        length_inches: 18,
        colorway: 'Natural black',
        density_percent: 150,
        draw_type: 'double_drawn',
        price_naira: 185000,
        cost_price_naira: 85000,
        stock_quantity: 3,
        weight_grams: 250,
        is_active: true,
      },
    ])
  }

  function toggleMedia(mid: string) {
    setSelectedMedia((prev) =>
      prev.includes(mid) ? prev.filter((x) => x !== mid) : [...prev, mid]
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Edit product</h1>
        <Button type="button" variant="primary" loading={saving} onClick={save}>
          Save
        </Button>
      </div>
      {message && <p className="text-sm text-ink-muted">{message}</p>}

      <section className="space-y-3 border border-vanilla-400 bg-vanilla-50 p-5">
        <h2 className="font-display text-xl">Basics</h2>
        <input
          className="h-12 w-full border border-vanilla-400 bg-vanilla-50 px-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <textarea
          className="w-full border border-vanilla-400 bg-vanilla-50 px-3 py-3"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="h-12 border border-vanilla-400 bg-vanilla-50 px-3"
            value={texture}
            onChange={(e) => setTexture(e.target.value)}
            placeholder="Texture"
          />
          <select
            className="h-12 border border-vanilla-400 bg-vanilla-50 px-3"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Featured on home
          </label>
        </div>
      </section>

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Variants & pricing (₦)</h2>
          <Button type="button" variant="secondary" onClick={addVariant}>
            Add variant
          </Button>
        </div>
        {variants.map((v, i) => (
          <div key={v.id || i} className="grid gap-2 border border-vanilla-400 p-3 md:grid-cols-4">
            <input
              className="h-10 border border-vanilla-400 px-2 text-sm"
              value={v.sku}
              onChange={(e) => updateVariant(i, { sku: e.target.value })}
              placeholder="SKU"
            />
            <input
              type="number"
              className="h-10 border border-vanilla-400 px-2 text-sm"
              value={v.length_inches ?? ''}
              onChange={(e) => updateVariant(i, { length_inches: Number(e.target.value) || null })}
              placeholder='Length "'
            />
            <input
              className="h-10 border border-vanilla-400 px-2 text-sm"
              value={v.colorway ?? ''}
              onChange={(e) => updateVariant(i, { colorway: e.target.value })}
              placeholder="Colorway"
            />
            <input
              type="number"
              className="h-10 border border-vanilla-400 px-2 text-sm"
              value={v.price_naira}
              onChange={(e) => updateVariant(i, { price_naira: Number(e.target.value) || 0 })}
              placeholder="Price ₦"
            />
            <input
              type="number"
              className="h-10 border border-vanilla-400 px-2 text-sm"
              value={v.cost_price_naira ?? ''}
              onChange={(e) =>
                updateVariant(i, {
                  cost_price_naira: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              placeholder="Cost ₦ (admin only)"
            />
            <input
              type="number"
              className="h-10 border border-vanilla-400 px-2 text-sm"
              value={v.stock_quantity}
              onChange={(e) => updateVariant(i, { stock_quantity: Number(e.target.value) || 0 })}
              placeholder="Stock"
            />
            <input
              type="number"
              className="h-10 border border-vanilla-400 px-2 text-sm"
              value={v.density_percent ?? ''}
              onChange={(e) =>
                updateVariant(i, { density_percent: Number(e.target.value) || null })
              }
              placeholder="Density %"
            />
            <input
              type="number"
              className="h-10 border border-vanilla-400 px-2 text-sm"
              value={v.weight_grams ?? ''}
              onChange={(e) => updateVariant(i, { weight_grams: Number(e.target.value) || null })}
              placeholder="Weight g"
            />
          </div>
        ))}
      </section>

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-5">
        <h2 className="font-display text-xl">Images</h2>
        <p className="text-sm text-ink-muted">
          Upload in Media first, then select. Order = gallery order.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {media.map((m) => {
            const on = selectedMedia.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMedia(m.id)}
                className={`border p-2 text-left ${on ? 'border-cherry-600' : 'border-vanilla-400'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.filename} className="aspect-square w-full object-cover" />
                <span className="mt-1 block truncate text-xs">{on ? 'Selected' : m.filename}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
