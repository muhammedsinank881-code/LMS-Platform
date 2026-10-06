import type { ComponentProps } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { DialogCloseButton } from './dialog-close-button'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close

const drawerVariants = cva('fixed z-40 flex flex-col bg-surface text-foreground shadow-modal', {
  variants: {
    side: {
      right: 'inset-y-0 right-0 h-full w-full border-l border-border',
      left: 'inset-y-0 left-0 h-full w-full border-r border-border',
      bottom: 'inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-lg border-t border-border pb-[env(safe-area-inset-bottom)]',
    },
    size: { sm: '', md: '', lg: '' },
  },
  compoundVariants: [
    { side: ['left', 'right'], size: 'sm', class: 'sm:max-w-sm' },
    { side: ['left', 'right'], size: 'md', class: 'sm:max-w-lg' },
    { side: ['left', 'right'], size: 'lg', class: 'sm:max-w-2xl' },
  ],
  defaultVariants: { side: 'right', size: 'md' },
})

export interface DrawerContentProps
  extends ComponentProps<typeof DialogPrimitive.Content>, VariantProps<typeof drawerVariants> {
  hideClose?: boolean
}

/**
 * Side panel built on Dialog (focus trap, Esc, scroll lock). Full width on mobile.
 * Always include a `DrawerTitle` and a `DrawerDescription` (or `aria-describedby={undefined}`).
 */
export function DrawerContent({
  className,
  side,
  size,
  hideClose,
  children,
  ...props
}: DrawerContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-foreground/40" />
      <DialogPrimitive.Content className={cn(drawerVariants({ side, size }), className)} {...props}>
        {children}
        {hideClose ? null : <DialogCloseButton />}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DrawerHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-border p-6 pr-14', className)}
      {...props}
    />
  )
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold leading-7 text-foreground', className)}
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export function DrawerBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex-1 overflow-y-auto p-6 text-sm', className)} {...props} />
}

export function DrawerFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}
