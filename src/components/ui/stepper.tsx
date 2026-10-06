import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface StepperStep {
  id: string
  label: string
}

export interface StepperProps {
  steps: StepperStep[]
  /** Zero-based index of the active step. Earlier steps render as completed. */
  currentStep: number
  'aria-label'?: string
  className?: string
}

/**
 * Non-interactive progress indicator for multi-step flows. On small screens only the
 * active label stays visible; the others remain available to screen readers.
 */
export function Stepper({
  steps,
  currentStep,
  'aria-label': ariaLabel = 'Progress',
  className,
}: StepperProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const status =
            index < currentStep ? 'complete' : index === currentStep ? 'current' : 'upcoming'
          const isLast = index === steps.length - 1
          return (
            <li
              key={step.id}
              aria-current={status === 'current' ? 'step' : undefined}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors',
                    status === 'complete' && 'border-primary bg-primary text-primary-foreground',
                    status === 'current' && 'border-primary bg-primary-subtle text-primary',
                    status === 'upcoming' && 'border-input bg-surface text-muted-foreground',
                  )}
                >
                  {status === 'complete' ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-sm font-medium',
                    status === 'current'
                      ? 'text-foreground'
                      : 'text-muted-foreground max-sm:sr-only',
                  )}
                >
                  {step.label}
                  <span className="sr-only">
                    {status === 'complete'
                      ? ' (completed)'
                      : status === 'current'
                        ? ' (current step)'
                        : ''}
                  </span>
                </span>
              </span>
              {isLast ? null : (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-3 h-px flex-1 transition-colors',
                    status === 'complete' ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
