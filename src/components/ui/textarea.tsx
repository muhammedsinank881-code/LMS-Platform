import { useEffect, useRef } from 'react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'
import { fieldVariants } from './styles'

export interface TextareaProps extends ComponentProps<'textarea'> {
  invalid?: boolean
  autoGrow?: boolean
  minRows?: number
  maxRows?: number
}

export function Textarea({
  className,
  invalid,
  autoGrow = false,
  minRows = 1,
  maxRows = 3,
  onChange,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resizeTextarea = () => {
    const textarea = textareaRef.current

    if (!textarea || !autoGrow) return

    textarea.style.height = 'auto'

    const computedStyle = window.getComputedStyle(textarea)
    const lineHeight = parseFloat(computedStyle.lineHeight)
    const padding = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom)

    const minHeight = lineHeight * minRows + padding
    const maxHeight = lineHeight * maxRows + padding

    const height = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)

    textarea.style.height = `${height}px`
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }

  useEffect(() => {
    resizeTextarea()
  }, [props.value, autoGrow, minRows, maxRows])

  return (
    <textarea
      ref={textareaRef}
      aria-invalid={invalid || undefined}
      className={cn(
        fieldVariants({ size: 'multiline', invalid }),
        autoGrow ? 'resize-none overflow-y-hidden' : 'resize-y',
        className,
      )}
      onChange={(event) => {
        onChange?.(event)
        resizeTextarea()
      }}
      {...props}
    />
  )
}
