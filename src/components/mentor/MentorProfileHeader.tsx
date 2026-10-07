import { useAuthStore } from '@/store/auth-store'

interface MentorProfileHeaderProps {
  collapsed?: boolean
}

export function MentorProfileHeader({ collapsed = false }: MentorProfileHeaderProps) {
  const user = useAuthStore((state) => state.user)
  const mentorName = user?.name || 'Ms. Husna'
  const initials = mentorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  if (collapsed) {
    return (
      <div className="flex justify-center py-4 border-b border-[#E2E8F0] dark:border-border">
        <div className="w-10 h-10 rounded-full bg-[#E8F7F3] dark:bg-[#0F9F83]/20 text-[#0F9F83] font-bold text-xs flex items-center justify-center border border-[#0F9F83]/30">
          {initials}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3.5 p-4 border-b border-[#E2E8F0] dark:border-border">
      <div className="w-11 h-11 rounded-full bg-[#E8F7F3] dark:bg-[#0F9F83]/20 text-[#0F9F83] font-bold text-sm flex items-center justify-center shrink-0 border border-[#0F9F83]/30 shadow-2xs">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-[#17324D] dark:text-foreground truncate leading-snug">
          {mentorName}
        </h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
          Teacher
        </p>
      </div>
    </div>
  )
}
