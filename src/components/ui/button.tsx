import type { ButtonProps, ButtonSize, ButtonVariant } from '@/types'
import { forwardRef } from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-cherry-600 text-vanilla-50 hover:bg-cherry-700 border-none',
  secondary:
    'bg-transparent text-ink hover:text-ink border border-ink',
  text: 'bg-transparent text-cherry-600 hover:text-cherry-700',
  'primary-on-violet':
    'bg-transparent text-vanilla-50 border border-vanilla-50 hover:bg-vanilla-50',
  destructive:
    'bg-transparent text-cherry-700 border border-cherry-700 hover:bg-cherry-700'
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 py-2',
  lg: 'h-12 px-6 text-base'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherry-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    ].join(' ')

    return (
      <button
        className={classes}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading && <span className="animate-spin">⟳</span>}
        {props.children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }