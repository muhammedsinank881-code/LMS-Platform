import { FolderGit2, Users } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle, ProgressBar } from '@/components/ui'
import type { CapstoneSummaryItem } from '../types'

interface CapstoneSummaryCardProps {
  projects: CapstoneSummaryItem[]
}

export function CapstoneSummaryCard({ projects }: CapstoneSummaryCardProps) {
  return (
    <Card className="border-border bg-surface shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="size-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Capstone Projects</CardTitle>
        </div>
        <Badge tone="primary" appearance="soft" size="sm">
          {projects.length} Active Teams
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {projects.map((proj) => (
            <div key={proj.id} className="p-3.5 rounded-md border border-border bg-surface hover:border-primary/30 transition-all space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">{proj.projectTitle}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Users className="size-3 text-primary shrink-0" />
                    <span>{proj.teamName} ({proj.membersCount} Members)</span>
                  </div>
                </div>
                <Badge
                  tone={
                    proj.health === 'on-track'
                      ? 'success'
                      : proj.health === 'blocked'
                      ? 'destructive'
                      : 'warning'
                  }
                  size="sm"
                  dot
                  className="self-start sm:self-center shrink-0"
                >
                  {proj.health === 'on-track'
                    ? 'On Track'
                    : proj.health === 'blocked'
                    ? 'Blocked'
                    : 'Review Needed'}
                </Badge>
              </div>

              <ProgressBar value={proj.progress} showValue label="Project Completion" size="sm" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
