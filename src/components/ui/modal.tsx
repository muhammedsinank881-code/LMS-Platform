import type { ComponentProps } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { DialogCloseButton } from './dialog-close-button'

export const Modal = DialogPrimitive.Root
export const ModalTrigger = DialogPrimitive.Trigger
export const ModalClose = DialogPrimitive.Close

const modalVariants = cva(
  'relative flex w-full flex-col rounded-md border border-border bg-surface text-foreground shadow-modal max-sm:h-dvh max-sm:max-h-dvh max-sm:rounded-none',
  {
    variants: {
      size: {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-2xl',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface ModalContentProps
  extends ComponentProps<typeof DialogPrimitive.Content>, VariantProps<typeof modalVariants> {
  /** Hide the top-right close button (keep a visible way to dismiss in the footer). */
  hideClose?: boolean
}

/**
 * Always include a `ModalTitle`. Include a `ModalDescription` too, or pass
 * `aria-describedby={undefined}` to opt out explicitly.
 */
export function ModalContent({
  className,
  size,
  hideClose,
  children,
  ...props
}: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-foreground/40 p-4 max-sm:place-items-stretch max-sm:p-0">
        <DialogPrimitive.Content className={cn(modalVariants({ size }), className)} {...props}>
          {children}
          {hideClose ? null : <DialogCloseButton />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
}

export function ModalHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1 p-6 pb-4 pr-14', className)} {...props} />
}

export function ModalTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold leading-7 text-foreground', className)}
      {...props}
    />
  )
}

export function ModalDescription({
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

export function ModalBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-6 py-2 text-sm max-sm:min-h-0 max-sm:flex-1 max-sm:overflow-y-auto', className)} {...props} />
}

export function ModalFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 p-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:pb-6',
        className,
      )}
      {...props}
    />
  )
}
