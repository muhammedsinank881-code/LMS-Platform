import type { RouteObject } from 'react-router-dom'
import { lazyPage } from '@/app/lazy-route'
import { MentorLayout } from '@/components/mentor/MentorLayout'

export const mentorRoutes: RouteObject[] = [
  {
    path: 'mentor',
    element: <MentorLayout />,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import('@/pages/mentor/Home/MentorHome'), 'MentorHome'),
      },
      {
        path: 'home',
        lazy: lazyPage(() => import('@/pages/mentor/Home/MentorHome'), 'MentorHome'),
      },
      {
        path: 'dashboard',
        lazy: lazyPage(() => import('@/pages/mentor/Home/MentorHome'), 'MentorHome'),
      },
      {
        path: 'classes',
        lazy: lazyPage(() => import('@/pages/mentor/MyClasses/MyClasses'), 'MyClasses'),
      },
      {
        path: 'classes/:classId',
        lazy: lazyPage(() => import('@/pages/mentor/MyClasses/ClassDetails'), 'ClassDetails'),
      },
      {
        path: 'my-classes',
        lazy: lazyPage(() => import('@/pages/mentor/MyClasses/MyClasses'), 'MyClasses'),
      },
      {
        path: 'batch-overview',
        lazy: lazyPage(() => import('@/pages/mentor/MyClasses/MyClasses'), 'MyClasses'),
      },
      {
        path: 'students',
        lazy: lazyPage(() => import('@/pages/mentor/Students/Students'), 'Students'),
      },
      {
        path: 'my-students',
        lazy: lazyPage(() => import('@/pages/mentor/Students/Students'), 'Students'),
      },
      {
        path: 'attendance',
        lazy: lazyPage(() => import('@/pages/mentor/Attendance/Attendance'), 'Attendance'),
      },
      {
        path: 'attendance-tracking',
        lazy: lazyPage(() => import('@/pages/mentor/Attendance/Attendance'), 'Attendance'),
      },
      {
        path: 'assignments',
        lazy: lazyPage(() => import('@/pages/mentor/Assignments/Assignments'), 'Assignments'),
      },
      {
        path: 'exams',
        lazy: lazyPage(() => import('@/pages/mentor/Exams/Exams'), 'Exams'),
      },
      {
        path: 'exams/:examId',
        lazy: lazyPage(() => import('@/pages/mentor/Exams/ExamDetails'), 'ExamDetails'),
      },
      {
        path: 'results',
        lazy: lazyPage(() => import('@/pages/mentor/Results/Results'), 'Results'),
      },
      {
        path: 'results/:resultId',
        lazy: lazyPage(() => import('@/pages/mentor/Results/ResultDetails'), 'ResultDetails'),
      },
      {
        path: 'performance-reports',
        lazy: lazyPage(() => import('@/pages/mentor/Results/Results'), 'Results'),
      },
      {
        path: 'timetable',
        lazy: lazyPage(() => import('@/pages/mentor/Timetable/Timetable'), 'Timetable'),
      },
      {
        path: 'messages',
        lazy: lazyPage(() => import('@/pages/mentor/Messages/Messages'), 'Messages'),
      },
      {
        path: 'notifications',
        lazy: lazyPage(() => import('@/pages/mentor/Notifications/Notifications'), 'Notifications'),
      },
      {
        path: 'profile',
        lazy: lazyPage(() => import('@/pages/mentor/Profile/Profile'), 'Profile'),
      },
      {
        path: 'settings',
        lazy: lazyPage(() => import('@/pages/mentor/Settings/Settings'), 'Settings'),
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
        path: 'schedule-1-on-1-sessions',
        lazy: lazyPage(
          () =>
            import('@/mentor-features/schedule-1-on-1-sessions/pages/Schedule1On1SessionsPage'),
          'Schedule1On1SessionsPage',
        ),
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
