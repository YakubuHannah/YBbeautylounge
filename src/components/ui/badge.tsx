import type { BadgeProps, BadgeVariant } from '@/types'
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-[100px] px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        success: 'bg-admin-success text-vanilla-50',
        warning: 'bg-violet-800 text-vanilla-50',
        error: 'bg-cherry-700 text-vanilla-50'
      }
    },
    defaultVariants: {
      variant: 'success'
    }
  }
)

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={badgeVariants({ variant, className })}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }