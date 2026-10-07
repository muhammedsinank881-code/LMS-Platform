import { PageHeader } from '@/components/layout/PageHeader'
import { ActiveCourseCard } from '../Components/ActiveCourseCard'
import { AssignmentsDeadlinesCard } from '../Components/AssignmentsDeadlinesCard'
import { AttendanceAnalyticsCard } from '../Components/AttendanceAnalyticsCard'
import { MentorChatWidget } from '../Components/MentorChatWidget'
import { PendingClassesSidebar } from '../Components/PendingClassesSidebar'
import { StudentAnnouncementsWidget } from '../Components/StudentAnnouncementsWidget'
import { StudentCertificatesWidget } from '../Components/StudentCertificatesWidget'
import { StudentStatsCards } from '../Components/StudentStatsCards'
import { MOCK_STUDENT_DATA } from '../../mock/student-data'

export function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${MOCK_STUDENT_DATA.studentName}! 👋`}
        description="Track your course progress, class attendance, assignments, and mentor communication."
      />

      {/* Top 5 Stats Cards */}
      <StudentStatsCards />

      {/* Attendance Analytics & Weekly Hours Chart */}
      <AttendanceAnalyticsCard />

      {/* Active Course & Pending Classes Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ActiveCourseCard />
          <AssignmentsDeadlinesCard />
        </div>
        <div>
          <PendingClassesSidebar />
        </div>
      </div>

      {/* Bottom Grid: Certificates, WhatsApp Mentor Chat, Announcements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StudentCertificatesWidget />
        <MentorChatWidget />
        <StudentAnnouncementsWidget />
      </div>
    </div>
  )
}
