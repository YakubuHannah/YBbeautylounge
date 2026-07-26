import type { ButtonProps, ButtonSize, ButtonVariant } from '@/types'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-cherry-600 text-vanilla-50 hover:bg-cherry-700',
        secondary:
          'bg-transparent text-ink hover:text-ink border border-ink',
        text: 'bg-transparent text-cherry-600 hover:text-cherry-700',
        'primary-on-violet':
          'bg-transparent text-vanilla-50 border border-vanilla-50 hover:bg-vanilla-50',
        destructive:
          'bg-transparent text-cherry-700 border border-cherry-700 hover:bg-cherry-700 hover:text-vanilla-50'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading && <span className="animate-spin">⟳</span>}
        {props.children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }