export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'text'
  | 'primary-on-violet'
  | 'destructive'

export type ButtonSize = 'sm' | 'md' | 'lg'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'elevated'
}

export type BadgeVariant = 'success' | 'warning' | 'error'

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  children: React.ReactNode
}
