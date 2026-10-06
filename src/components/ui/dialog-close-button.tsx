import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './button'

/** Shared top-right close control for Modal and Drawer. */
export function DialogCloseButton({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Close asChild>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Close"
        className={cn('absolute right-4 top-4', className)}
      >
        <X aria-hidden="true" />
      </Button>
    </DialogPrimitive.Close>
  )
}
