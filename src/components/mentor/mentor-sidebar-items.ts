import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Settings,
  User,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface MentorNavItem {
  id: string
  label: string
  path: string
  aliases?: string[]
  icon: LucideIcon
  badge?: number
  hasDot?: boolean
}

export const MENTOR_SIDEBAR_ITEMS: MentorNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/mentor/home',
    aliases: ['/mentor', '/mentor/dashboard'],
    icon: Home,
  },
  {
    id: 'my-classes',
    label: 'My Classes',
    path: '/mentor/classes',
    aliases: ['/mentor/my-classes', '/mentor/batch-overview'],
    icon: BookOpen,
  },
  {
    id: 'students',
    label: 'Students',
    path: '/mentor/students',
    aliases: ['/mentor/my-students'],
    icon: Users,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/mentor/attendance',
    aliases: ['/mentor/attendance-tracking'],
    icon: UserCheck,
  },
  {
    id: 'assignments',
    label: 'Assignments',
    path: '/mentor/assignments',
    icon: FileText,
  },
  {
    id: 'exams',
    label: 'Exams',
    path: '/mentor/exams',
    icon: Award,
  },
  {
    id: 'results',
    label: 'Results',
    path: '/mentor/results',
    aliases: ['/mentor/performance-reports'],
    icon: BarChart3,
  },
  {
    id: 'timetable',
    label: 'Timetable',
    path: '/mentor/timetable',
    icon: Calendar,
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/mentor/messages',
    icon: MessageSquare,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/mentor/notifications',
    icon: Bell,
    hasDot: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/mentor/profile',
    icon: User,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/mentor/settings',
    aliases: ['/settings'],
    icon: Settings,
  },
]
