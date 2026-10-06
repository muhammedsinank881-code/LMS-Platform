import { createContext, useContext, type ComponentProps } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/cn'
import { focusRing } from './styles'

type TabsVariant = 'underline' | 'pill'

const TabsVariantContext = createContext<TabsVariant>('underline')

export interface TabsProps extends ComponentProps<typeof TabsPrimitive.Root> {
  variant?: TabsVariant
}

export function Tabs({ variant = 'underline', ...props }: TabsProps) {
  return (
    <TabsVariantContext value={variant}>
      <TabsPrimitive.Root {...props} />
    </TabsVariantContext>
  )
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  const variant = useContext(TabsVariantContext)
  return (
    <TabsPrimitive.List
      className={cn(
        'flex max-w-full items-center overflow-x-auto overflow-y-hidden',
        variant === 'underline'
          ? 'w-full gap-1 border-b border-border'
          : 'inline-flex gap-1 rounded-md bg-muted p-1',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      className={cn(
        // Inset ring so the focus indicator is not clipped by the scrolling list.
        `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground ${focusRing} focus-visible:ring-inset focus-visible:ring-offset-0`,
        variant === 'underline'
          ? '-mb-px h-10 border-b-2 border-transparent px-3 data-[state=active]:border-primary max-sm:h-11'
          : 'h-8 rounded-sm px-3 data-[state=active]:bg-surface max-sm:h-11',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('mt-4', focusRing, className)} {...props} />
}
