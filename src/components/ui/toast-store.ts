import { useSyncExternalStore } from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  /** Milliseconds before auto-dismiss. Defaults to the Toaster's duration. */
  duration?: number
  action?: { label: string; onClick: () => void }
}

export interface ToastData extends ToastOptions {
  id: string
}

type VariantOptions = Omit<ToastOptions, 'title' | 'variant'>

const MAX_TOASTS = 5

let toasts: ToastData[] = []
let counter = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return toasts
}

export function dismissToast(id?: string) {
  toasts = id ? toasts.filter((t) => t.id !== id) : []
  emit()
}

function show(options: ToastOptions): string {
  counter += 1
  const id = `toast-${counter}`
  toasts = [...toasts, { ...options, id }].slice(-MAX_TOASTS)
  emit()
  return id
}

/** Imperative API: `toast({ title })`, `toast.success('Saved')`, `toast.error('Failed', { description })`. */
export const toast = Object.assign(show, {
  success: (title: string, options?: VariantOptions) =>
    show({ ...options, title, variant: 'success' }),
  error: (title: string, options?: VariantOptions) => show({ ...options, title, variant: 'error' }),
  warning: (title: string, options?: VariantOptions) =>
    show({ ...options, title, variant: 'warning' }),
  info: (title: string, options?: VariantOptions) => show({ ...options, title, variant: 'info' }),
  dismiss: dismissToast,
})

export function useToast() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { toasts: current, toast, dismiss: dismissToast }
}
