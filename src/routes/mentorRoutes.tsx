import type { RouteObject } from 'react-router-dom'
import { lazyPage } from '@/app/lazy-route'
import { AppShell } from '@/components/layout/AppShell'

export const mentorRoutes: RouteObject[] = [
  {
    path: 'mentor',
    element: <AppShell />,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import('@/mentor-features/dashboard/pages/MentorDashboardPage'), 'MentorDashboardPage'),
      },
      {
        path: 'home',
        lazy: lazyPage(() => import('@/mentor-features/dashboard/pages/MentorDashboardPage'), 'MentorDashboardPage'),
      },
      {
        path: 'dashboard',
        lazy: lazyPage(() => import('@/mentor-features/dashboard/pages/MentorDashboardPage'), 'MentorDashboardPage'),
      },
      {
        path: 'classes',
        lazy: lazyPage(() => import('@/mentor-features/my-classes/pages/MyClassesPage'), 'MyClassesPage'),
      },
      {
        path: 'classes/:classId',
        lazy: lazyPage(() => import('@/mentor-features/my-classes/pages/ClassDetailsPage'), 'ClassDetailsPage'),
      },
      {
        path: 'my-classes',
        lazy: lazyPage(() => import('@/mentor-features/my-classes/pages/MyClassesPage'), 'MyClassesPage'),
      },
      {
        path: 'batch-overview',
        lazy: lazyPage(() => import('@/mentor-features/my-classes/pages/MyClassesPage'), 'MyClassesPage'),
      },
      {
        path: 'students',
        lazy: lazyPage(() => import('@/mentor-features/my-students/pages/MyStudentsPage'), 'MyStudentsPage'),
      },
      {
        path: 'my-students',
        lazy: lazyPage(() => import('@/mentor-features/my-students/pages/MyStudentsPage'), 'MyStudentsPage'),
      },
      {
        path: 'attendance',
        lazy: lazyPage(() => import('@/mentor-features/attendance-tracking/pages/AttendanceTrackingPage'), 'AttendanceTrackingPage'),
      },
      {
        path: 'attendance-tracking',
        lazy: lazyPage(() => import('@/mentor-features/attendance-tracking/pages/AttendanceTrackingPage'), 'AttendanceTrackingPage'),
      },
      {
        path: 'materials',
        lazy: lazyPage(() => import('@/mentor-features/materials/pages/MaterialsPage'), 'MaterialsPage'),
      },
      {
        path: 'materials/upload',
        lazy: lazyPage(() => import('@/mentor-features/materials/pages/MaterialsPage'), 'MaterialsPage'),
      },
      {
        path: 'assignments',
        lazy: lazyPage(() => import('@/mentor-features/assignments/pages/AssignmentsPage'), 'AssignmentsPage'),
      },
      {
        path: 'assignments/create',
        lazy: lazyPage(() => import('@/mentor-features/assignments/pages/CreateAssignmentPage'), 'CreateAssignmentPage'),
      },
      {
        path: 'assignments/new',
        lazy: lazyPage(() => import('@/mentor-features/assignments/pages/CreateAssignmentPage'), 'CreateAssignmentPage'),
      },
      {
        path: 'exams',
        lazy: lazyPage(() => import('@/mentor-features/exams/pages/ExamsPage'), 'ExamsPage'),
      },
      {
        path: 'exams/:examId',
        lazy: lazyPage(() => import('@/mentor-features/exams/pages/ExamDetailsPage'), 'ExamDetailsPage'),
      },
      {
        path: 'results',
        lazy: lazyPage(() => import('@/mentor-features/results/pages/ResultsPage'), 'ResultsPage'),
      },
      {
        path: 'results/:resultId',
        lazy: lazyPage(() => import('@/mentor-features/results/pages/ResultDetailsPage'), 'ResultDetailsPage'),
      },
      {
        path: 'performance-reports',
        lazy: lazyPage(() => import('@/mentor-features/results/pages/ResultsPage'), 'ResultsPage'),
      },
      {
        path: 'timetable',
        lazy: lazyPage(() => import('@/mentor-features/timetable/pages/TimetablePage'), 'TimetablePage'),
      },
      {
        path: 'messages',
        lazy: lazyPage(() => import('@/mentor-features/messages/pages/MessagesPage'), 'MessagesPage'),
      },
      {
        path: 'notifications',
        lazy: lazyPage(() => import('@/mentor-features/notifications/pages/NotificationsPage'), 'NotificationsPage'),
      },
      {
        path: 'profile',
        lazy: lazyPage(() => import('@/mentor-features/profile/pages/ProfilePage'), 'ProfilePage'),
      },
      {
        path: 'settings',
        lazy: lazyPage(() => import('@/mentor-features/settings/pages/SettingsPage'), 'SettingsPage'),
      },
      {
        path: 'student-submissions-code-reviews',
        lazy: lazyPage(
          () =>
            import(
              '@/mentor-features/student-submissions-code-reviews/pages/StudentSubmissionsCodeReviewsPage'
            ),
          'StudentSubmissionsCodeReviewsPage',
        ),
      },
      {
        path: 'capstone-projects',
        lazy: lazyPage(
          () => import('@/mentor-features/capstone-projects/pages/CapstoneProjectsPage'),
          'CapstoneProjectsPage',
        ),
      },
      {
        path: 'schedule',
        lazy: lazyPage(() => import('@/mentor-features/schedule/pages/SchedulePage'), 'SchedulePage'),
      },
      {
        path: 'schedule-1-on-1-sessions',
        lazy: lazyPage(() => import('@/mentor-features/schedule/pages/SchedulePage'), 'SchedulePage'),
      },
      {
        path: 'helpdesk-resource-hub',
        lazy: lazyPage(
          () => import('@/mentor-features/helpdesk-resource-hub/pages/HelpdeskResourceHubPage'),
          'HelpdeskResourceHubPage',
        ),
      },
    ],
  },
]
