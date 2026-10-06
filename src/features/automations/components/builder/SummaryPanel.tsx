import { AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { summarizeAutomation, type Lookups, type ValidationIssue } from '@/lib/automation'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { AutomationContent } from '@/types'

/** The plain-language sentence, updated live. The region is polite so screen readers hear changes once typing pauses. */
export function SummaryPanel({
  content,
  lookups,
  issues,
}: {
  content: AutomationContent
  lookups: Lookups
  issues: ValidationIssue[]
}) {
  const sentence = summarizeAutomation(content, lookups)
  const announced = useDebouncedValue(sentence, 600)
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>In plain language</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-6 text-foreground">{sentence}</p>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announced}
        </p>
        <div aria-label="Checks" className="space-y-2">
          {issues.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info aria-hidden="true" className="h-4 w-4" />
              No problems found.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {issues.map((issue, index) => (
                <li key={`${issue.path}-${index}`} className="flex items-start gap-2 text-sm">
                  <AlertTriangle
                    aria-hidden="true"
                    className={issue.severity === 'error' ? 'mt-0.5 h-4 w-4 shrink-0 text-destructive' : 'mt-0.5 h-4 w-4 shrink-0 text-warning'}
                  />
                  <span>
                    <span className="font-medium">{issue.severity === 'error' ? 'Error' : 'Warning'}: </span>
                    {issue.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
