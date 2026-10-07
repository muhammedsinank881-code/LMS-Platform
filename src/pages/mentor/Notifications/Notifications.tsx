import { useState } from 'react'
import { Bell, CheckCheck, Clock, FileText, UserCheck } from 'lucide-react'

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

export function Notifications() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#17324D] dark:text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            System updates, student submission alerts and attendance warnings
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F9F83] hover:bg-[#E8F7F3] rounded-lg transition-colors cursor-pointer"
        >
          <CheckCheck className="size-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
              n.read
                ? 'bg-white dark:bg-card border-[#E2E8F0] dark:border-border'
                : 'bg-[#E8F7F3]/30 dark:bg-[#0F9F83]/10 border-[#0F9F83]/40'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-[#0F9F83]/10 text-[#0F9F83] flex items-center justify-center shrink-0 mt-0.5 font-bold">
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
                <h3 className="text-sm font-bold text-[#17324D] dark:text-foreground truncate">
                  {n.title}
                </h3>
                <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                  <Clock className="size-3" /> {n.time}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                {n.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications
