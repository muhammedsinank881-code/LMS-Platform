import * as ToastPrimitive from '@radix-ui/react-toast'
import { ToastItem } from './toast'
import { useToast } from './toast-store'

export interface ToasterProps {
  /** Default auto-dismiss time in ms. */
  duration?: number
}

/** Mount once near the app root. Fire toasts anywhere with `toast.success(...)`. */
export function Toaster({ duration = 5000 }: ToasterProps) {
  const { toasts, dismiss } = useToast()

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={duration} label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
      <ToastPrimitive.Viewport className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex w-full flex-col gap-2 p-4 outline-none sm:right-0 sm:left-auto sm:max-w-sm lg:bottom-0" />
    </ToastPrimitive.Provider>
  )
}
