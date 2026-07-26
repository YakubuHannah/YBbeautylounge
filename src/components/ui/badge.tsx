import type { BadgeProps, BadgeVariant } from '@/types'
import { forwardRef } from 'react'

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-admin-success text-vanilla-50',
  warning: 'bg-violet-800 text-vanilla-50',
  error: 'bg-cherry-700 text-vanilla-50'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'success', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-[100px] px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cherry-600 focus:ring-offset-2'

    const classes = [
      baseClasses,
      variantClasses[variant],
      className
    ].join(' ')

    return (
      <span
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }