import { Avatar, Badge, Card, CardContent } from '@/components/ui'

interface MentorWelcomeBannerProps {
  name: string
  title: string
  activeBatch: string
}

export function MentorWelcomeBanner({ name, title, activeBatch }: MentorWelcomeBannerProps) {
  return (
    <Card className="border-border bg-gradient-to-r from-surface via-surface to-primary/5 shadow-2xs">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Avatar name={name} size="sm" className="sm:size-md border border-primary/20 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-foreground tracking-tight truncate">
                  Welcome back, {name} 👋
                </h1>
                <Badge tone="primary" appearance="soft" size="sm" className="text-[10px] sm:text-xs">
                  {title}
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
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
