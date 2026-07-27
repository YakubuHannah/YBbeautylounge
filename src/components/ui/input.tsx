import { forwardRef } from 'react'

import type { InputProps } from '@/types'

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    const baseClasses =
      'flex w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 py-2 text-sm text-ink transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherry-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

    const errorClasses = 'border-cherry-700 focus-visible:ring-cherry-700'

    const classes = [baseClasses, hasError && errorClasses, className]
      .filter(Boolean)
      .join(' ')

    return <input type={type} className={classes} ref={ref} {...props} />
  }
)
Input.displayName = 'Input'

export { Input }