import * as ToastPrimitive from '@radix-ui/react-toast'
import type { LucideIcon } from 'lucide-react'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './button'
import type { ToastData, ToastVariant } from './toast-store'

const icons: Record<ToastVariant, { icon: LucideIcon; className: string } | null> = {
  default: null,
  success: { icon: CircleCheck, className: 'text-success' },
  error: { icon: CircleX, className: 'text-destructive' },
  warning: { icon: TriangleAlert, className: 'text-warning' },
  info: { icon: Info, className: 'text-info' },
}

export interface ToastItemProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, title, description, variant = 'default', duration, action } = toast
  const iconConfig = icons[variant]
  const Icon = iconConfig?.icon

  return (
    <ToastPrimitive.Root
      duration={duration}
      type={variant === 'error' ? 'foreground' : 'background'}
      onOpenChange={(open) => {
        if (!open) onDismiss(id)
      }}
      className={cn(
        'pointer-events-auto relative flex w-full items-start gap-3 rounded-md border border-border bg-surface p-4 pr-12 text-foreground shadow-popover',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'transition-transform data-[swipe=move]:transition-none',
      )}
    >
      {Icon ? (
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconConfig.className)} aria-hidden="true" />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <ToastPrimitive.Title className="text-sm font-semibold">{title}</ToastPrimitive.Title>
        {description ? (
          <ToastPrimitive.Description className="text-sm text-muted-foreground">
            {description}
          </ToastPrimitive.Description>
        ) : null}
        {action ? (
          <ToastPrimitive.Action altText={action.label} asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 self-start"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </ToastPrimitive.Action>
        ) : null}
      </div>
      <ToastPrimitive.Close asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss notification"
          className="absolute right-2 top-2"
        >
          <X aria-hidden="true" />
        </Button>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}
