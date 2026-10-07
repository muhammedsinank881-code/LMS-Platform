import { Calendar, MessageSquare, Plus, Users } from 'lucide-react'
import { Avatar, Badge, Button, Card, CardContent } from '@/components/ui'
import type { MentorProfile } from '../types'

interface MentorHeaderProps {
  profile: MentorProfile
}

export function MentorHeader({ profile }: MentorHeaderProps) {
  return (
    <Card className="border-border bg-surface shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Profile & Batch info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar name={profile.name} size="xl" className="border-2 border-primary/20 shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">{profile.name}</h1>
                <Badge tone="primary" appearance="soft" size="sm">
                  {profile.role}
                </Badge>
                <Badge tone="success" appearance="soft" size="sm" dot>
                  Active Mentor
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Users className="size-4 text-primary shrink-0" />
                  {profile.batchName} ({profile.batchCode})
                </span>
                <span className="hidden sm:inline text-muted-foreground/60">•</span>
                <span>{profile.totalStudents} Assigned Students</span>
                <span className="hidden sm:inline text-muted-foreground/60">•</span>
                <span className="text-success font-semibold">
                  {profile.engagementRate}% Engagement Rate
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t border-border/50 lg:border-t-0">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Calendar className="size-4" />
              Schedule 1-on-1
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <MessageSquare className="size-4" />
              Broadcast to Batch
            </Button>
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              <Plus className="size-4" />
              Review Submissions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
