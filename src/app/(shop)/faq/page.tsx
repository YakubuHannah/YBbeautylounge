import { STARTER_FAQS } from '@/lib/faqs'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'FAQ' }

function groupFaqs(rows: { category: string; question: string; answer: string }[]) {
  const groups = new Map<string, { q: string; a: string }[]>()
  for (const row of rows) {
    const list = groups.get(row.category) ?? []
    list.push({ q: row.question, a: row.answer })
    groups.set(row.category, list)
  }
  return Array.from(groups, ([cat, items]) => ({ cat, items }))
}

async function getFaqGroups() {
  try {
    const rows = await prisma.faq.findMany({
      where: { is_active: true },
      orderBy: [{ category: 'asc' }, { sort_order: 'asc' }],
    })
    return groupFaqs(rows.length ? rows : STARTER_FAQS)
  } catch {
    return groupFaqs(STARTER_FAQS)
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
