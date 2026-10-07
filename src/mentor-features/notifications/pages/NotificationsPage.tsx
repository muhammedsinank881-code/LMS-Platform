import { useState } from 'react'
import { Bell, CheckCheck, Clock, FileText, UserCheck } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: 'attendance' | 'assignment' | 'system'
}

const MOCK_NOTIFS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Attendance Alert',
    description: 'Devadathan P was marked absent for 3 consecutive days in BCA - 4th Semester.',
    time: '30 mins ago',
    read: false,
    type: 'attendance',
  },
  {
    id: 'n-2',
    title: 'Assignment Submitted',
    description: 'Muhammad Riyan submitted "React Custom Hooks Lab" for review.',
    time: '2 hours ago',
    read: false,
    type: 'assignment',
  },
  {
    id: 'n-3',
    title: 'Mid-Term Exam Reminder',
    description: 'BCA - 4th Semester Mid-Term Practical Exam is scheduled for 15 Oct 2026.',
    time: 'Yesterday',
    read: true,
    type: 'system',
  },
]

export function NotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <PageHeader
        title="Notifications"
        description="System updates, student submission alerts and attendance warnings"
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          <Button type="button" variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="size-4 mr-1.5" />
            <span>Mark all as read</span>
          </Button>
        }
      />

      {/* Notifications List */}
      <div className="space-y-3">
        {notifs.map((n) => (
          <Card
            key={n.id}
            className={`p-4 flex items-start gap-3.5 transition-all ${
              n.read
                ? 'bg-surface border-border'
                : 'bg-primary-subtle/50 border-primary/30'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
              {n.type === 'attendance' ? (
                <UserCheck className="size-4" />
              ) : n.type === 'assignment' ? (
                <FileText className="size-4" />
              ) : (
                <Bell className="size-4" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground truncate">
                  {n.title}
                </h3>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" /> {n.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {n.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Notifications = NotificationsPage
export default NotificationsPage
