import { ArrowRight, Megaphone, MoreVertical } from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'
import type { AnnouncementItem } from '../types'

interface AnnouncementsCardProps {
  announcements: AnnouncementItem[]
}

export function AnnouncementsCard({ announcements }: AnnouncementsCardProps) {
  return (
    <div className="space-y-2 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">Announcements</h2>
        <button
          type="button"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          View All <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        {announcements.map((item) => (
          <Card
            key={item.id}
            className="border-border bg-surface shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs flex-1 flex flex-col justify-center"
          >
            <CardContent className="p-3 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-primary-subtle text-primary shrink-0">
                  <Megaphone className="size-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{item.title}</h4>
                  {item.category ? (
                    <span className="text-[11px] text-muted-foreground">{item.category}</span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge tone="info" appearance="soft" size="sm" className="text-[10px] px-2 h-5">
                  {item.date}
                </Badge>
                <button
                  type="button"
                  className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Announcement options"
                >
                  <MoreVertical className="size-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
