import { Code2, ExternalLink, FileCode } from 'lucide-react'
import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { StudentSubmission } from '../types'

interface CodeReviewQueueCardProps {
  submissions: StudentSubmission[]
}

export function CodeReviewQueueCard({ submissions }: CodeReviewQueueCardProps) {
  return (
    <Card className="border-border bg-surface shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="size-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Student Submissions &amp; Code Reviews</CardTitle>
        </div>
        <Badge tone="warning" appearance="soft" size="sm">
          {submissions.length} Pending
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 text-sm first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={item.studentName} size="md" className="shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground truncate">{item.studentName}</span>
                    <span className="text-xs text-muted-foreground">• {item.batchName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileCode className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{item.assignmentTitle}</span>
                    <span className="shrink-0">({item.submittedAt})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0">
                <Badge
                  tone={
                    item.status === 'pending'
                      ? 'warning'
                      : item.status === 'needs-revision'
                      ? 'destructive'
                      : 'success'
                  }
                  size="sm"
                  dot
                >
                  {item.status === 'pending'
                    ? 'Pending'
                    : item.status === 'needs-revision'
                    ? 'Revision'
                    : 'Approved'}
                </Badge>
                <Button variant="outline" size="sm">
                  Review Code
                  <ExternalLink className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
