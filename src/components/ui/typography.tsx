import { cva, type VariantProps } from 'class-variance-authority'

const headingVariants = cva(
  'font-display font-normal leading-tight tracking-tight',
  {
    variants: {
      level: {
        h1: 'text-40 font-display leading-[1.1] tracking-tight',
        h2: 'text-32 font-display leading-[1.15]',
        h3: 'text-19 font-display leading-[1.3]',
        eyebrow: 'text-xs font-sans font-bold leading-[1.2] tracking-[0.14em] uppercase text-violet-800',
        urgency: 'text-xs font-sans font-bold leading-[1.2] tracking-[0.14em] uppercase text-ink'
      }
    },
    defaultVariants: {
      level: 'h1'
    }
  }
)

const textVariants = cva(
  'font-body leading-[1.6]',
  {
    variants: {
      variant: {
        body: 'text-base text-ink',
        bodyLarge: 'text-lg text-ink',
        muted: 'text-sm text-ink-muted',
        price: 'text-2xl font-bold text-cherry-600'
      }
    },
    defaultVariants: {
      variant: 'body'
    }
  }
)

export { headingVariants, textVariants }