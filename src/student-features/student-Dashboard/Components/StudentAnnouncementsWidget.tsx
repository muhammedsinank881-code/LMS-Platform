import { Bell, Calendar } from 'lucide-react'
import { Card } from '@/components/ui'
import { MOCK_STUDENT_DATA } from '../../mock/student-data'

export function StudentAnnouncementsWidget() {
  const { announcements } = MOCK_STUDENT_DATA

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Important':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      case 'Notice':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">Announcements & Notices</h3>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">{announcements.length} Feed</span>
      </div>

      <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border/60 bg-surface-hover p-3 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${getTagColor(item.tag)}`}>
                {item.tag}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" /> {item.date}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
            <p className="text-[11px] text-muted-foreground line-clamp-2">{item.content}</p>
            <p className="text-[10px] text-muted-foreground pt-1">By {item.author}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
