import { Bell, Calendar } from 'lucide-react'
import { Avatar, Badge, Button, Card, CardContent } from '@/components/ui'

interface MentorWelcomeBannerProps {
  name: string
  title: string
  activeBatch: string
}

export function MentorWelcomeBanner({ name, title, activeBatch }: MentorWelcomeBannerProps) {
  return (
    <Card className="border-border bg-gradient-to-r from-surface via-surface to-primary/5 shadow-2xs">
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={name} size="md" className="border border-primary/20 shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Welcome back, {name} 👋
                </h1>
                <Badge tone="primary" appearance="soft" size="sm">
                  {title}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cohort: <span className="font-medium text-foreground">{activeBatch}</span> • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="size-3.5" />
              <span className="absolute top-1 right-1 size-1.5 rounded-full bg-destructive" />
            </Button>
            <Button variant="primary" size="sm" className="h-8 text-xs px-3">
              <Calendar className="size-3.5" />
              Schedule Class
            </Button>
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}
