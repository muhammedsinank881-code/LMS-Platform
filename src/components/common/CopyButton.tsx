import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, toast, type ButtonProps } from '@/components/ui'

const CONFIRM_MS = 2000

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children' | 'value'> {
  value: string
  /** What is being copied, for the accessible name: "Copy webhook URL". */
  label?: string
  /** Hide the visible text and show only the icon. */
  iconOnly?: boolean
}

/**
 * Copies text and confirms it briefly, both visibly and to screen readers through a polite live
 * region. The copied value is never logged.
 */
export function CopyButton({ value, label = 'Copy', iconOnly = false, size = 'sm', variant = 'outline', ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), CONFIRM_MS)
    } catch {
      toast.error('Could not copy', { description: 'Select the text and copy it manually.' })
    }
  }

  return (
    <>
      <Button
        {...props}
        type="button"
        size={iconOnly ? (size === 'sm' ? 'icon-sm' : 'icon') : size}
        variant={variant}
        aria-label={iconOnly ? (copied ? 'Copied' : label) : undefined}
        onClick={() => void copy()}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {iconOnly ? null : copied ? 'Copied' : label}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  )
}
