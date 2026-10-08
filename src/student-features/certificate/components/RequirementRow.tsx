import { CheckCircle2, Clock, Lock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui'
import type { RequirementStatus } from '../data/certificateData'

interface RequirementRowProps {
  label: string
  sublabel?: string
  status: RequirementStatus
  /** Secondary info shown on the right (e.g. score, progress %) */
  trailing?: string
  /** Optional click handler — renders a clickable row */
  onClick?: () => void
  className?: string
}

const STATUS_CONFIG: Record<
  RequirementStatus,
  { icon: React.ElementType; tone: 'success' | 'warning' | 'neutral' | 'destructive'; label: string; iconColor: string }
> = {
  completed: {
    icon: CheckCircle2,
    tone: 'success',
    label: 'Completed',
    iconColor: 'text-success',
  },
  in_progress: {
    icon: Loader2,
    tone: 'warning',
    label: 'In Progress',
    iconColor: 'text-amber-500',
  },
  pending: {
    icon: Clock,
    tone: 'neutral',
    label: 'Pending',
    iconColor: 'text-muted-foreground',
  },
  locked: {
    icon: Lock,
    tone: 'neutral',
    label: 'Locked',
    iconColor: 'text-muted-foreground/60',
  },
}

export function RequirementRow({
  label,
  sublabel,
  status,
  trailing,
  onClick,
  className,
}: RequirementRowProps) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'

  const inner = (
    <>
      {/* Left: status icon */}
      <div className="shrink-0 mt-0.5">
        <Icon
          className={cn(
            'h-4 w-4',
            cfg.iconColor,
            status === 'in_progress' && 'animate-spin',
          )}
        />
      </div>

      {/* Middle: label */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-xs font-semibold leading-snug',
            isLocked ? 'text-muted-foreground/60' : 'text-foreground',
            isCompleted && 'line-through opacity-70',
          )}
        >
          {label}
        </p>
        {sublabel && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{sublabel}</p>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {trailing && (
          <span
            className={cn(
              'text-xs font-bold tabular-nums',
              isCompleted ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {trailing}
          </span>
        )}
        <Badge tone={cfg.tone} size="sm" dot className="text-[10px] font-semibold capitalize">
          {cfg.label}
        </Badge>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isLocked}
        className={cn(
          'w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-muted/40',
          isLocked && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        {inner}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3',
        isLocked && 'opacity-50',
        className,
      )}
    >
      {inner}
    </div>
  )
}
