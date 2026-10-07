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
import { Button, Card } from '@/components/ui'
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
    <div className="space-y-6 text-foreground">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/mentor/classes')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to My Classes</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-md bg-muted font-mono text-foreground border border-border">
            {cls.courseCode}
          </span>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
              isActive
                ? 'bg-success/10 text-success'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className={`size-2 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            {isActive ? 'Active Class' : 'Completed Class'}
          </span>
        </div>
      </div>

      {/* Main Class Banner Header */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-lg bg-primary-subtle text-primary shrink-0">
              <Code2 className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {cls.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {cls.courseName} ({cls.program}) · {cls.year} · {cls.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/mentor/attendance')}
              className="flex items-center gap-2"
            >
              <UserCheck className="size-4" />
              <span>Take Attendance</span>
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground border-t border-border pt-4">
          {cls.description}
        </p>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Users className="size-3.5 text-primary" />
              <span>Enrolled Students</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">
              {cls.studentsCount}
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <MapPin className="size-3.5 text-primary" />
              <span>Room Location</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">
              {cls.room}
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <GraduationCap className="size-3.5 text-primary" />
              <span>Attendance Rate</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">
              {cls.attendanceRate}%
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Clock className="size-3.5 text-primary" />
              <span>Syllabus Progress</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">
              {cls.syllabusProgress}%
            </p>
          </div>
        </div>
      </Card>

      {/* Schedule & Mentor Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Calendar className="size-4 text-primary" />
            <span>Class Schedule</span>
          </div>
          <p className="text-sm font-semibold text-foreground bg-muted p-3 rounded-md border border-border">
            {cls.schedule}
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <BookOpen className="size-4 text-primary" />
            <span>Assigned Instructor / Mentor</span>
          </div>
          <div className="flex items-center gap-3 bg-muted p-3 rounded-md border border-border">
            <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              {(user?.name || 'Ms. Husna').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {user?.name || 'Ms. Husna'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || 'mentor@leadflow.test'} · Assigned Mentor
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Student Roster Section */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Enrolled Student Roster
            </h3>
            <p className="text-xs text-muted-foreground">
              Showing students registered in {cls.courseCode}
            </p>
          </div>

          {/* Student Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search roster..."
              className="w-full h-9 pl-9 pr-3 bg-surface border border-input rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Attendance</th>
                <th className="p-3 text-right">Today&apos;s Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono text-xs text-foreground font-semibold">
                      {st.rollNumber}
                    </td>
                    <td className="p-3 text-foreground font-semibold">
                      {st.name}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {st.email}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{st.attendancePercentage}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${st.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {st.statusToday === 'present' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="size-3" /> Present
                        </span>
                      ) : st.statusToday === 'late' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning bg-warning/15 px-2.5 py-0.5 rounded-full">
                          Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-0.5 rounded-full">
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
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

export default ClassDetails
