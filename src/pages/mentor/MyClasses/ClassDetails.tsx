import { useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  GraduationCap,
  MapPin,
  Search,
  UserCheck,
  Users,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/store/auth-store'
import { MOCK_MENTOR_CLASSES } from './mockData'

export function ClassDetails() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [studentSearch, setStudentSearch] = useState('')

  // Find class by route param or fallback to first class
  const cls = MOCK_MENTOR_CLASSES.find((c) => c.id === classId) || MOCK_MENTOR_CLASSES[0]

  const isActive = cls.status === 'active'

  const filteredStudents = cls.enrolledStudents.filter((st) => {
    const q = studentSearch.toLowerCase().trim()
    if (!q) return true
    return (
      st.name.toLowerCase().includes(q) ||
      st.rollNumber.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2 px-2 sm:px-4 pb-16 text-[#17324D] dark:text-foreground">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/mentor/classes')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#17324D] dark:hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to My Classes</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[#17324D] dark:text-foreground border border-[#E2E8F0] dark:border-border">
            {cls.courseCode}
          </span>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className={`size-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {isActive ? 'Active Class' : 'Completed Class'}
          </span>
        </div>
      </div>

      {/* Main Class Banner Header */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#E8F7F3] text-[#0F9F83] shrink-0">
              <Code2 className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] dark:text-foreground">
                {cls.title}
              </h1>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 font-medium">
                {cls.courseName} ({cls.program}) · {cls.year} · {cls.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              onClick={() => navigate('/mentor/attendance')}
              className="bg-[#0F9F83] hover:bg-[#0C826B] text-white font-semibold rounded-xl flex items-center gap-2"
            >
              <UserCheck className="size-4" />
              <span>Take Attendance</span>
            </Button>
          </div>
        </div>

        <p className="text-sm text-[#64748B] dark:text-slate-300 border-t border-[#E2E8F0] dark:border-border pt-4">
          {cls.description}
        </p>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-border/50">
            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 font-medium">
              <Users className="size-3.5 text-[#0F9F83]" />
              <span>Enrolled Students</span>
            </div>
            <p className="text-lg font-bold text-[#17324D] dark:text-foreground mt-1">
              {cls.studentsCount}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-border/50">
            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 font-medium">
              <MapPin className="size-3.5 text-[#0F9F83]" />
              <span>Room Location</span>
            </div>
            <p className="text-lg font-bold text-[#17324D] dark:text-foreground mt-1">
              {cls.room}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-border/50">
            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 font-medium">
              <GraduationCap className="size-3.5 text-[#0F9F83]" />
              <span>Attendance Rate</span>
            </div>
            <p className="text-lg font-bold text-[#17324D] dark:text-foreground mt-1">
              {cls.attendanceRate}%
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-border/50">
            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 font-medium">
              <Clock className="size-3.5 text-[#0F9F83]" />
              <span>Syllabus Progress</span>
            </div>
            <p className="text-lg font-bold text-[#17324D] dark:text-foreground mt-1">
              {cls.syllabusProgress}%
            </p>
          </div>
        </div>
      </div>

      {/* Schedule & Mentor Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-[#17324D] dark:text-foreground">
            <Calendar className="size-4 text-[#0F9F83]" />
            <span>Class Schedule</span>
          </div>
          <p className="text-sm font-semibold text-[#17324D] dark:text-foreground bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-[#E2E8F0] dark:border-border">
            {cls.schedule}
          </p>
        </div>

        <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-[#17324D] dark:text-foreground">
            <BookOpen className="size-4 text-[#0F9F83]" />
            <span>Assigned Instructor / Mentor</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-[#E2E8F0] dark:border-border">
            <div className="size-9 rounded-full bg-[#0F9F83] text-white flex items-center justify-center font-bold text-sm">
              {(user?.name || 'Ms. Husna').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-[#17324D] dark:text-foreground">
                {user?.name || 'Ms. Husna'}
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {user?.email || 'mentor@leadflow.test'} · Assigned Mentor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Roster Section */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#17324D] dark:text-foreground">
              Enrolled Student Roster
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Showing students registered in {cls.courseCode}
            </p>
          </div>

          {/* Student Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-[#64748B]" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search roster..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-border rounded-xl text-xs text-[#17324D] dark:text-foreground placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0F9F83]"
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-bold text-[#64748B] dark:text-slate-300 border-b border-[#E2E8F0] dark:border-border">
              <tr>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Attendance</th>
                <th className="p-3.5 text-right">Today&apos;s Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-border font-medium">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-mono text-xs text-[#17324D] dark:text-slate-200 font-bold">
                      {st.rollNumber}
                    </td>
                    <td className="p-3.5 text-[#17324D] dark:text-foreground font-semibold">
                      {st.name}
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-slate-400 text-xs">
                      {st.email}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{st.attendancePercentage}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-[#0F9F83]"
                            style={{ width: `${st.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      {st.statusToday === 'present' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="size-3" /> Present
                        </span>
                      ) : st.statusToday === 'late' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">
                          Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full">
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#64748B]">
                    No students found matching current query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ClassDetails
