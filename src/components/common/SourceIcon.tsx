import { createElement } from 'react'
import { cn } from '@/lib/cn'
import { getSourceIcon } from '@/lib/source-icon'

export interface SourceIconProps {
  icon: string
  label?: string
  className?: string
}

export function SourceIcon({ icon, label, className }: SourceIconProps) {
  return createElement(getSourceIcon(icon), {
    'aria-hidden': label ? undefined : true,
    'aria-label': label,
    className: cn('h-4 w-4', className),
  })
}
