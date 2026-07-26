import type { CardProps } from '@/types'
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-[2px] border border-vanilla-400 bg-vanilla-50 p-4 shadow-sm',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-md'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, className })}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export { Card, cardVariants }