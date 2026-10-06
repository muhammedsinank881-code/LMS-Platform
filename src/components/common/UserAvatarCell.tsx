import { Avatar } from '@/components/ui'
import { EMPTY_VALUE } from '@/lib/format/shared'
import { cn } from '@/lib/cn'

export interface UserAvatarCellProps {
  name: string | null | undefined
  src?: string | null
  className?: string
}

export function UserAvatarCell({ name, src, className }: UserAvatarCellProps) {
  if (!name) {
    return <span className="text-muted-foreground">{EMPTY_VALUE}</span>
  }
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <Avatar name={name} src={src} size="xs" />
      <span className="truncate text-sm text-foreground">{name}</span>
    </span>
  )
}
