import { forwardRef } from 'react'

interface HeadingProps {
  level: 'h1' | 'h2' | 'h3' | 'eyebrow' | 'urgency'
  className?: string
  children: React.ReactNode
}

const headingClasses: Record<NonNullable<HeadingProps['level']>, string> = {
  h1: 'text-40 font-display font-normal leading-[1.1] tracking-tight',
  h2: 'text-32 font-display font-normal leading-[1.15]',
  h3: 'text-19 font-display font-normal leading-[1.3]',
  eyebrow: 'text-xs font-sans font-bold leading-[1.2] tracking-[0.14em] uppercase text-violet-800',
  urgency: 'text-xs font-sans font-bold leading-[1.2] tracking-[0.14em] uppercase text-ink'
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, className, children }, ref) => {
    const Tag = level === 'h1' ? 'h1' : level === 'h2' ? 'h2' : level === 'h3' ? 'h3' : 'span'
    const classes = [headingClasses[level], className].filter(Boolean).join(' ')

    return <Tag ref={ref} className={classes}>{children}</Tag>
  }
)
Heading.displayName = 'Heading'

interface TextProps {
  variant?: 'body' | 'bodyLarge' | 'muted' | 'price'
  className?: string
  children: React.ReactNode
}

const textClasses: Record<NonNullable<TextProps['variant']>, string> = {
  body: 'font-body leading-[1.6] text-base text-ink',
  bodyLarge: 'font-body leading-[1.6] text-lg text-ink',
  muted: 'font-body leading-[1.6] text-sm text-ink-muted',
  price: 'font-body leading-[1.2] text-2xl font-bold text-cherry-600 tabular-nums'
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant = 'body', className, children }, ref) => {
    const classes = [textClasses[variant], className].filter(Boolean).join(' ')

    return (
      <p ref={ref} className={classes}>
        {children}
      </p>
    )
  }
)
Text.displayName = 'Text'

export { Heading, Text }