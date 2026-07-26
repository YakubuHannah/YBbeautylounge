import type { InputProps } from '@/types'
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const inputVariants = cva(
  'flex w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 py-2 text-sm text-ink transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherry-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      hasError: {
        true: 'border-cherry-700 focus-visible:ring-cherry-700'
      }
    },
    defaultVariants: {
      hasError: false
    }
  }
)

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <>
        <input
          type={type}
          className={inputVariants({ hasError })}
          ref={ref}
          {...props}
        />
      </>
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }