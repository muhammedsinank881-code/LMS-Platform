import { FileSpreadsheet, Sparkles, type LucideIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/cn'
import type { OnboardingValues } from '../schemas'

type ImportChoice = OnboardingValues['importChoice']

const choices: Array<{
  value: ImportChoice
  icon: LucideIcon
  title: string
  description: string
}> = [
  {
    value: 'import',
    icon: FileSpreadsheet,
    title: 'Import leads',
    description: 'Upload a CSV or Excel file from the Leads page once your workspace is ready.',
  },
  {
    value: 'skip',
    icon: Sparkles,
    title: 'Start fresh',
    description: 'Add leads manually or capture them from your sources. Import any time later.',
  },
]

export function ImportStep() {
  const { watch, setValue } = useFormContext<OnboardingValues>()
  const selected = watch('importChoice')

  return (
    <div role="group" aria-label="How do you want to start?" className="grid gap-3 sm:grid-cols-2">
      {choices.map(({ value, icon: Icon, title, description }) => {
        const active = selected === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => setValue('importChoice', value, { shouldDirty: true })}
            className={cn(
              'flex flex-col items-start gap-2 rounded-md border p-4 text-left transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              active
                ? 'border-primary bg-primary-subtle'
                : 'border-border bg-surface hover:bg-muted',
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')}
            />
            <span className="text-sm font-semibold text-foreground">{title}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </button>
        )
      })}
    </div>
  )
}
