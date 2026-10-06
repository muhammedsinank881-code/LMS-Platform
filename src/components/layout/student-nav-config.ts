import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    CalendarCheck,
    FolderKanban,
    Award,
    type LucideIcon,
} from 'lucide-react'

export interface StudentNavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const STUDENT_NAV_ITEMS : StudentNavItem [] =[
    {
        label: 'Dashboard',
        path: '/student/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'My Courses',
        path: '/student/courses',
        icon: BookOpen,
    },
    {
        label: 'Assignments & Quizzes',
        path: '/student/assignments',
        icon: ClipboardList,
    },
    {
        label: 'Attendance',
        path: '/student/attendance',
        icon: CalendarCheck,
    },
    {
        label: 'Projects',
        path: '/student/projects',
        icon: FolderKanban,
    },
    {
        label: 'Certificates',
        path: '/student/certificates',
        icon: Award,
    },
]