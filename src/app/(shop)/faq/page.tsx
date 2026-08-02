import { prisma } from '@/lib/prisma'

export const metadata = { title: 'FAQ' }

const FALLBACK: { cat: string; items: { q: string; a: string }[] }[] = [
  {
    cat: 'Ordering',
    items: [
      {
        q: 'Do I need an account to buy?',
        a: 'No. Guest checkout uses your phone number as your customer record.',
      },
      {
        q: 'Can I pay in parts?',
        a: 'Yes — pay in full or 50% deposit with balance before dispatch.',
      },
    ],
  },
  {
    cat: 'Delivery',
    items: [
      {
        q: 'How fast is dispatch?',
        a: 'Orders are dispatched within 3–5 working days.',
      },
      {
        q: 'Is there free delivery?',
        a: 'Free delivery applies from ₦200,000 subtotal.',
      },
    ],
  },
  {
    cat: 'Restoration',
    items: [
      {
        q: 'How does restoration work?',
        a: 'Submit intake with photos, receive a quote, pay a deposit, and track status with a private link.',
      },
    ],
  },
]

async function getFaqGroups() {
  try {
    const rows = await prisma.faq.findMany({
      where: { is_active: true },
      orderBy: [{ category: 'asc' }, { sort_order: 'asc' }],
    })
    if (!rows.length) return FALLBACK
    const groups = new Map<string, { q: string; a: string }[]>()
    for (const row of rows) {
      const list = groups.get(row.category) ?? []
      list.push({ q: row.question, a: row.answer })
      groups.set(row.category, list)
    }
    return Array.from(groups, ([cat, items]) => ({ cat, items }))
  } catch {
    return FALLBACK
  }
}

export default async function FaqPage() {
  const faqs = await getFaqGroups()
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">Help</p>
      <h1 className="mt-2 font-display text-4xl text-ink">FAQ</h1>
      <div className="mt-12 space-y-12">
        {faqs.map((group) => (
          <section key={group.cat}>
            <h2 className="font-display text-2xl text-ink">{group.cat}</h2>
            <ul className="mt-6 space-y-6">
              {group.items.map((item) => (
                <li key={item.q} className="border-b border-vanilla-400 pb-6">
                  <h3 className="text-base font-semibold text-ink">{item.q}</h3>
                  <p className="mt-2 text-ink-muted">{item.a}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
