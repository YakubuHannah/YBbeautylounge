export const metadata = { title: 'FAQ' }

const faqs = [
  {
    cat: 'Ordering',
    items: [
      {
        q: 'Do I need an account to buy?',
        a: 'No. Guest checkout uses your phone number as your customer record.',
      },
      {
        q: 'Can I pay in parts?',
        a: 'Yes — pay in full or 50% deposit with balance before dispatch. Pay-in-4 is built for scale.',
      },
    ],
  },
  {
    cat: 'Delivery',
    items: [
      {
        q: 'How fast is Lagos dispatch?',
        a: 'Orders are typically prepared within 1 business day, then 2–4 days delivery in Lagos.',
      },
      {
        q: 'Is there free delivery?',
        a: 'Free delivery applies from ₦200,000 subtotal (founder-editable in admin).',
      },
    ],
  },
  {
    cat: 'Hair care',
    items: [
      {
        q: 'Can I colour the unit?',
        a: 'Check the product attributes — colourable flag is set per variant where true.',
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

export default function FaqPage() {
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
