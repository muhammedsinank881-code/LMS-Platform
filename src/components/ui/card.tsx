import { createContext, useContext, type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

type CardSize = 'md' | 'sm'

const CardSizeContext = createContext<CardSize>('md')

const cardVariants = cva('rounded-md border border-border text-foreground', {
  variants: {
    variant: {
      default: 'bg-surface',
      muted: 'bg-muted',
      interactive: 'bg-surface transition-colors hover:border-primary/50 hover:bg-primary-subtle',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface CardProps extends ComponentProps<'div'>, VariantProps<typeof cardVariants> {
  size?: CardSize
}

export function Card({ className, variant, size = 'md', ...props }: CardProps) {
  return (
    <CardSizeContext value={size}>
      <div className={cn(cardVariants({ variant }), className)} {...props} />
    </CardSizeContext>
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  const size = useContext(CardSizeContext)
  return <div className={cn('flex flex-col gap-1', size === 'sm' ? 'p-3 pb-2' : 'p-6', className)} {...props} />
}

export function CardTitle({ className, children, ...props }: ComponentProps<'h3'>) {
  const size = useContext(CardSizeContext)
  return (
    <h3 className={cn('font-semibold', size === 'sm' ? 'text-sm leading-5' : 'text-base leading-6', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  const size = useContext(CardSizeContext)
  return <div className={cn(size === 'sm' ? 'px-3 pb-3' : 'p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  const size = useContext(CardSizeContext)
  return <div className={cn('flex items-center gap-2', size === 'sm' ? 'px-3 pb-3' : 'p-6 pt-0', className)} {...props} />
}
