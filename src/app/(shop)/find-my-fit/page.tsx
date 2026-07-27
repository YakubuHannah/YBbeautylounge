import { FitFinder } from '@/components/fit/fit-finder'

export const metadata = { title: 'Find my fit' }

export default function FindMyFitPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-12">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          Personal styling
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Find my fit</h1>
        <p className="mt-3 text-ink-muted">
          Share a clear, front-facing photo and our stylist suggests the pieces from the current
          collection that frame your face best.
        </p>
      </div>
      <FitFinder />
    </main>
  )
}
