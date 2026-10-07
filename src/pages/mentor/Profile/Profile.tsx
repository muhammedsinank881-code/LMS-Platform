import { BookOpen, Calendar, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

export function Profile() {
  const user = useAuthStore((state) => state.user)
  const name = user?.name || 'Ms. Husna'

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#17324D] dark:text-foreground">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-2xs">
        <div className="w-20 h-20 rounded-full bg-[#E8F7F3] text-[#0F9F83] text-2xl font-extrabold flex items-center justify-center border-2 border-[#0F9F83]/30 shrink-0">
          {name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{name}</h1>
              <p className="text-xs sm:text-sm font-semibold text-[#0F9F83]">
                Senior Teacher • Computer Science Department
              </p>
            </div>

            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200/60 self-center sm:self-start">
              Active Mentor
            </span>
          </div>

          <p className="text-xs text-[#64748B] dark:text-slate-400 pt-2 leading-relaxed">
            Passionate software engineer and computer science lecturer with 6+ years of experience in Web Development, Database Systems, and mentoring capstone project teams.
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-5 space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B]">
            Contact Information
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-[#0F9F83]" />
              <span>{user?.email || 'husna.teacher@leadflow-lms.edu'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-[#0F9F83]" />
              <span>+91 98765 43200</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-[#0F9F83]" />
              <span>Main CS Faculty Block, Room 302</span>
            </div>
          </div>
        </div>

        {/* Academic Responsibilities */}
        <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-5 space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B]">
            Assigned Responsibilities
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="size-4 text-[#0F9F83]" /> Assigned Batches
              </span>
              <span className="font-bold">3 Batches (24 Students)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="size-4 text-[#0F9F83]" /> Office Hours
              </span>
              <span className="font-bold">Mon & Thu (02:00 PM - 04:00 PM)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#0F9F83]" /> Role Scope
              </span>
              <span className="font-bold">Teacher / Mentor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
