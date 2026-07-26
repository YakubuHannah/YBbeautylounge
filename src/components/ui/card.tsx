import type { CardProps } from '@/types'
import { forwardRef } from 'react'

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = 'rounded-[2px] border border-vanilla-400 bg-vanilla-50 p-4 shadow-sm'
    const elevatedClasses = 'shadow-md'

    const classes = [
      baseClasses,
      variant === 'elevated' && elevatedClasses,
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export { Card }