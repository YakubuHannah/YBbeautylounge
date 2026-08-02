'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

const TEXTURE_OPTIONS = [
  { value: '', label: 'Select texture…' },
  { value: 'bone_straight', label: 'Bone straight' },
  { value: 'body_wave', label: 'Body wave' },
  { value: 'deep_wave', label: 'Deep wave' },
  { value: 'water_wave', label: 'Water wave / water curls' },
  { value: 'curly', label: 'Curly' },
  { value: 'kinky_curly', label: 'Kinky curly' },
  { value: 'bob', label: 'Bob' },
  { value: 'other', label: 'Other (type in description)' },
]

type VariantForm = {
  sku: string
  length_inches: string
  colorway: string
  density_percent: string
  draw_type: string
  price_naira: string
  cost_price_naira: string
  stock_quantity: string
  weight_grams: string
}

function emptyVariant(): VariantForm {
  return {
    sku: '',
    length_inches: '',
    colorway: '',
    density_percent: '',
    draw_type: '',
    price_naira: '',
    cost_price_naira: '',
    stock_quantity: '',
    weight_grams: '',
  }
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
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {help && <span className="block text-xs text-ink-muted">{help}</span>}
      {children}
    </label>
  )
}

const inputClass =
  'mt-1 h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink'

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [texture, setTexture] = useState('')
  const [hairOrigin, setHairOrigin] = useState('')
  const [care, setCare] = useState('')
  const [status, setStatus] = useState('draft')
  const [featured, setFeatured] = useState(false)
  const [variants, setVariants] = useState<VariantForm[]>([emptyVariant()])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  function updateVariant(i: number, patch: Partial<VariantForm>) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Product name is required.')
      return
    }
    if (!texture) {
      setError('Please choose a texture.')
      return
    }
    const hasPrice = variants.some((v) => Number(v.price_naira) > 0)
    if (!hasPrice) {
      setError('Add at least one variant with a sell price in naira.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          texture,
          hair_origin: hairOrigin.trim() || null,
          care_instructions: care.trim() || null,
          status,
          featured,
          category_id: categoryId || null,
          variants: variants
            .filter((v) => v.price_naira !== '' || v.sku || v.length_inches)
            .map((v, i) => ({
              sku: v.sku.trim() || `SKU-${Date.now().toString(36)}-${i + 1}`,
              length_inches: v.length_inches === '' ? null : Number(v.length_inches),
              colorway: v.colorway.trim() || null,
              density_percent: v.density_percent === '' ? null : Number(v.density_percent),
              draw_type: v.draw_type.trim() || null,
              price: Number(v.price_naira || 0),
              cost_price: v.cost_price_naira === '' ? null : Number(v.cost_price_naira),
              stock_quantity: v.stock_quantity === '' ? 0 : Number(v.stock_quantity),
              weight_grams: v.weight_grams === '' ? null : Number(v.weight_grams),
            })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not create product')
        return
      }
      router.push(`/admin/products/${data.product.id}`)
      router.refresh()
    } catch {
      setError('Network error — try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/products" className="text-sm text-cherry-600">
            ← Back to products
          </Link>
          <h1 className="mt-2 font-display text-3xl text-ink">New product</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Fill every field you know. Leave optional ones blank. You can add photos on the next
            screen after saving.
          </p>
        </div>
        <Button type="submit" variant="primary" loading={saving}>
          Create product
        </Button>
      </div>

      {error && (
        <p className="rounded-[2px] border border-cherry-200 bg-cherry-50 px-4 py-3 text-sm text-cherry-700">
          {error}
        </p>
      )}

      <section className="space-y-5 border border-vanilla-400 bg-vanilla-50 p-6">
        <h2 className="font-display text-2xl text-ink">About this product</h2>

        <Field
          label="Product name *"
          help="What customers see on the shop (e.g. Water curls lace frontal wig)."
        >
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Water curls 13x4"
            required
          />
        </Field>

        <Field
          label="Description"
          help="Story and selling points. You can edit this anytime."
        >
          <textarea
            className={`${inputClass} h-28 py-3`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Soft water curls, pre-plucked hairline…"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Texture *"
            help="Main look customers filter by. Choose one — bone straight is only one type, not a default."
          >
            <select
              className={inputClass}
              value={texture}
              onChange={(e) => setTexture(e.target.value)}
              required
            >
              {TEXTURE_OPTIONS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category" help="Hair, accessories… manage the list under Admin → Categories.">
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Hair origin"
            help="Where the hair is from (e.g. Brazilian, Vietnamese). Optional."
          >
            <input
              className={inputClass}
              value={hairOrigin}
              onChange={(e) => setHairOrigin(e.target.value)}
              placeholder="e.g. Brazilian"
            />
          </Field>
        </div>

        <Field
          label="Care instructions"
          help="How customers should wash and style. Shown on the product page."
        >
          <textarea
            className={`${inputClass} h-24 py-3`}
            value={care}
            onChange={(e) => setCare(e.target.value)}
            placeholder="Sulfate-free shampoo, air dry…"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Status"
            help="Draft = hidden from shop. Active = live on the website."
          >
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft (not on shop yet)</option>
              <option value="active">Active (live on shop)</option>
            </select>
          </Field>

          <Field label="Featured" help="Show on the homepage featured row.">
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Feature on homepage
            </label>
          </Field>
        </div>
      </section>

      <section className="space-y-5 border border-vanilla-400 bg-vanilla-50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-ink">Sizes & prices</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Each row is one option customers can buy (e.g. 16″ black vs 18″ brown). Sell price is
              what the customer pays. Stock is how many you have of that option.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => setVariants((v) => [...v, emptyVariant()])}>
            Add another option
          </Button>
        </div>

        {variants.map((v, i) => (
          <div key={i} className="space-y-4 border border-vanilla-400 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-800">
              Option {i + 1}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="SKU (stock code)"
                help="Your internal code. Leave blank and we’ll generate one."
              >
                <input
                  className={inputClass}
                  value={v.sku}
                  onChange={(e) => updateVariant(i, { sku: e.target.value })}
                  placeholder="e.g. WC-16-BLK"
                />
              </Field>
              <Field
                label="Length (inches)"
                help="Hair length in inches, e.g. 16, 18, 20."
              >
                <input
                  type="number"
                  min={8}
                  max={40}
                  className={inputClass}
                  value={v.length_inches}
                  onChange={(e) => updateVariant(i, { length_inches: e.target.value })}
                  placeholder="e.g. 18"
                />
              </Field>
              <Field label="Colour / colorway" help="e.g. Natural black, Brown, Burgundy.">
                <input
                  className={inputClass}
                  value={v.colorway}
                  onChange={(e) => updateVariant(i, { colorway: e.target.value })}
                  placeholder="e.g. Natural black"
                />
              </Field>
              <Field
                label="Sell price (₦) *"
                help="What the customer pays, in naira only. Example: 185000 for ₦185,000."
              >
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={v.price_naira}
                  onChange={(e) => updateVariant(i, { price_naira: e.target.value })}
                  placeholder="e.g. 185000"
                />
              </Field>
              <Field
                label="Your cost (₦)"
                help="What you paid the supplier. Only you see this — never on the shop."
              >
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={v.cost_price_naira}
                  onChange={(e) => updateVariant(i, { cost_price_naira: e.target.value })}
                  placeholder="e.g. 85000"
                />
              </Field>
              <Field
                label="Stock available *"
                help="How many pieces of this exact option you have right now."
              >
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={v.stock_quantity}
                  onChange={(e) => updateVariant(i, { stock_quantity: e.target.value })}
                  placeholder="e.g. 5"
                />
              </Field>
              <Field
                label="Density (%)"
                help="How full the unit is. Common: 150, 180, 200."
              >
                <input
                  type="number"
                  min={100}
                  max={300}
                  className={inputClass}
                  value={v.density_percent}
                  onChange={(e) => updateVariant(i, { density_percent: e.target.value })}
                  placeholder="e.g. 150"
                />
              </Field>
              <Field
                label="Draw type"
                help="Quality signal: single, double drawn, or SDD (super double drawn)."
              >
                <select
                  className={inputClass}
                  value={v.draw_type}
                  onChange={(e) => updateVariant(i, { draw_type: e.target.value })}
                >
                  <option value="">Select…</option>
                  <option value="single">Single drawn</option>
                  <option value="double_drawn">Double drawn</option>
                  <option value="super_double_drawn">Super double drawn (SDD)</option>
                </select>
              </Field>
              <Field label="Weight (grams)" help="Optional. Nigerian buyers often look for this.">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={v.weight_grams}
                  onChange={(e) => updateVariant(i, { weight_grams: e.target.value })}
                  placeholder="e.g. 250"
                />
              </Field>
            </div>
            {variants.length > 1 && (
              <button
                type="button"
                className="text-sm text-cherry-700 underline"
                onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
              >
                Remove this option
              </button>
            )}
          </div>
        ))}
      </section>

      <p className="text-sm text-ink-muted">
        After you create the product, you’ll land on the edit page where you can attach photos from
        the media library.
      </p>

      <Button type="submit" variant="primary" className="h-12 w-full" loading={saving}>
        Create product
      </Button>
    </form>
  )
}
