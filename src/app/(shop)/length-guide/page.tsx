export const metadata = { title: 'Length guide' }

const lengths = [
  { inches: '12"', sits: 'Chin to collarbone', best: 'Bobs, low-maintenance days' },
  { inches: '14"', sits: 'Collarbone', best: 'Shoulder polish without weight' },
  { inches: '16"', sits: 'Upper chest', best: 'Everyday length, easy movement' },
  { inches: '18"', sits: 'Mid chest', best: 'Versatile styling with presence' },
  { inches: '20"', sits: 'Lower chest', best: 'Statement length, fuller read' },
  { inches: '22"+', sits: 'Waist-bound', best: 'Drama — denser caps help' },
]

export default function LengthGuidePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
        Reference
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">Length guide</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        Same body landmarks, plain language. Density reads fuller on shorter units — say so if
        you’re between sizes.
      </p>

      <div className="mt-10 overflow-hidden bg-vanilla-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/length-guide.jpg"
          alt="Bone straight unit on a mannequin, showing how the length falls"
          className="h-auto w-full"
        />
      </div>

      <table className="mt-12 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-vanilla-400 text-[11px] uppercase tracking-widest text-violet-800">
            <th className="py-3 font-semibold">Length</th>
            <th className="py-3 font-semibold">Where it sits</th>
            <th className="py-3 font-semibold">Best for</th>
          </tr>
        </thead>
        <tbody>
          {lengths.map((row) => (
            <tr key={row.inches} className="border-b border-vanilla-400">
              <td className="py-4 font-semibold text-ink">{row.inches}</td>
              <td className="py-4 text-ink-muted">{row.sits}</td>
              <td className="py-4 text-ink-muted">{row.best}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
