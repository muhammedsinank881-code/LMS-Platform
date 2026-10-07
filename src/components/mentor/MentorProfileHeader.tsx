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
      <div className="flex justify-center py-4 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-primary-subtle text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
          {initials}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3.5 p-4 border-b border-border">
      <div className="w-10 h-10 rounded-full bg-primary-subtle text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-foreground truncate leading-snug">
          {mentorName}
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          Teacher
        </p>
      </div>
    </div>
  )
}
