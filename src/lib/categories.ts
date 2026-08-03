import { prisma } from '@/lib/prisma'

const SEED_VERSION = '2'

/** Hair types from the homepage design plus Accessories. One-time seed; the
 * founder renames, hides, deletes, and adds more in Admin → Categories. */
export const DEFAULT_CATEGORIES = [
  { name: 'Bone straight', slug: 'bone-straight' },
  { name: 'Curly', slug: 'curly' },
  { name: 'Wavy', slug: 'wavy' },
  { name: 'Bob wigs', slug: 'bob-wigs' },
  { name: 'Frontal wigs', slug: 'frontal-wigs' },
  { name: 'Closure wigs', slug: 'closure-wigs' },
  { name: 'Accessories', slug: 'accessories' },
]

/** Creates any missing default categories, exactly once per seed version —
 * after that, founder deletions stick. */
export async function ensureDefaultCategories(): Promise<void> {
  try {
    const seeded = await prisma.setting.findUnique({
      where: { key: 'categories_seed_version' },
    })
    if (seeded?.value === SEED_VERSION) return

    const existing = await prisma.collection.findMany({ select: { slug: true } })
    const have = new Set(existing.map((c) => c.slug))
    const missing = DEFAULT_CATEGORIES.filter((c) => !have.has(c.slug))
    if (missing.length) {
      await prisma.collection.createMany({
        data: missing.map((c, i) => ({
          name: c.name,
          slug: c.slug,
          sort_order: have.size + i,
          is_active: true,
          published_at: new Date(),
        })),
        skipDuplicates: true,
      })
    }
    await prisma.setting.upsert({
      where: { key: 'categories_seed_version' },
      create: { key: 'categories_seed_version', value: SEED_VERSION, value_type: 'string' },
      update: { value: SEED_VERSION },
    })
  } catch {
    // seeding must never break a page render
  }
}
