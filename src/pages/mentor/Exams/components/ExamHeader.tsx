import { Bell, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

interface ExamHeaderProps {
  onOpenCreateModal: () => void
}

export function ExamHeader({ onOpenCreateModal }: ExamHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] dark:text-foreground">
          Exams
        </h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
          View and manage exams for your assigned classes
        </p>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          type="button"
          onClick={onOpenCreateModal}
          className="bg-[#0F9F83] hover:bg-[#0C826B] text-white font-medium shadow-xs rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all cursor-pointer border-0"
        >
          <Plus className="size-4" />
          <span>Create Exam</span>
        </Button>

        <button
          type="button"
          onClick={() => navigate('/mentor/notifications')}
          className="relative p-2.5 rounded-xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card text-[#64748B] hover:text-[#17324D] dark:hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-card" />
        </button>
      </div>
    </div>
  )
}
