import { useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Code2,
  GraduationCap,
  MapPin,
  Search,
  UserCheck,
  Users,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Input } from '@/components/ui'
import { useAuthStore } from '@/store/auth-store'
import { MOCK_MENTOR_CLASSES } from '../mockData'

export function ClassDetailsPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [studentSearch, setStudentSearch] = useState('')

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
    <div className="space-y-4 sm:space-y-6 text-foreground">
      {/* Back Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/mentor/classes')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Back to My Classes</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Badge tone="neutral" size="sm" className="font-mono text-[10px] sm:text-xs">{cls.courseCode}</Badge>
          <Badge tone={isActive ? 'success' : 'neutral'} size="sm" dot={isActive} className="text-[10px] sm:text-xs">
            {isActive ? 'Active Class' : 'Completed Class'}
          </Badge>
        </div>
      </div>

      {/* Main Class Banner Header */}
      <Card className="p-3.5 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="p-2 sm:p-3 rounded-md bg-primary-subtle text-primary shrink-0">
              <Code2 className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-foreground truncate">
                {cls.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 font-medium truncate">
                {cls.courseName} ({cls.program}) · {cls.year} · {cls.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate('/mentor/attendance')}
              className="h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
            >
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span>Take Attendance</span>
            </Button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground border-t border-border pt-3 sm:pt-4">
          {cls.description}
        </p>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1 sm:pt-2">
          <div className="p-2.5 sm:p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
              <span>Enrolled</span>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-foreground mt-0.5 sm:mt-1">
              {cls.studentsCount}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
              <span>Room</span>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-foreground mt-0.5 sm:mt-1">
              {cls.room}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
              <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
              <span>Attendance</span>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-foreground mt-0.5 sm:mt-1">
              {cls.attendanceRate}%
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
              <span>Syllabus</span>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-foreground mt-0.5 sm:mt-1">
              {cls.syllabusProgress}%
            </p>
          </div>
        </div>
      </Card>

      {/* Schedule & Mentor Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
        <Card className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground text-xs sm:text-sm">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span>Class Schedule</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-foreground bg-muted p-2.5 sm:p-3 rounded-md border border-border">
            {cls.schedule}
          </p>
        </Card>

        <Card className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground text-xs sm:text-sm">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span>Assigned Instructor / Mentor</span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 bg-muted p-2.5 sm:p-3 rounded-md border border-border">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              {(user?.name || 'Ms. Husna').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {user?.name || 'Ms. Husna'}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {user?.email || 'mentor@leadflow.test'} · Assigned Mentor
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Student Roster Section */}
      <Card className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              Enrolled Student Roster
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Showing students registered in {cls.courseCode}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              type="search"
              size="sm"
              leftAdornment={<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search roster..."
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-md border border-border bg-surface -mx-3.5 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
            <thead className="bg-muted/50 text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-2.5 sm:p-3">Roll Number</th>
                <th className="p-2.5 sm:p-3">Student Name</th>
                <th className="p-2.5 sm:p-3">Email</th>
                <th className="p-2.5 sm:p-3">Attendance</th>
                <th className="p-2.5 sm:p-3 text-right">Today&apos;s Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-2.5 sm:p-3 font-mono text-[11px] sm:text-xs text-foreground font-semibold">
                      {st.rollNumber}
                    </td>
                    <td className="p-2.5 sm:p-3 text-foreground font-semibold text-xs sm:text-sm">
                      {st.name}
                    </td>
                    <td className="p-2.5 sm:p-3 text-muted-foreground text-[11px] sm:text-xs">
                      {st.email}
                    </td>
                    <td className="p-2.5 sm:p-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-semibold text-xs">{st.attendancePercentage}%</span>
                        <div className="w-12 sm:w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${st.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 sm:p-3 text-right">
                      {st.statusToday === 'present' ? (
                        <Badge tone="success" size="sm" dot className="text-[10px] sm:text-xs">
                          Present
                        </Badge>
                      ) : st.statusToday === 'late' ? (
                        <Badge tone="warning" size="sm" className="text-[10px] sm:text-xs">
                          Late
                        </Badge>
                      ) : (
                        <Badge tone="destructive" size="sm" className="text-[10px] sm:text-xs">
                          Absent
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground text-xs sm:text-sm">
                    No students found matching current query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export const ClassDetails = ClassDetailsPage
export default ClassDetailsPage

