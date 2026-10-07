import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CalendarClock,
  CheckSquare,
  FileText,
  Handshake,
  Home,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  ScrollText,
  Settings,
  User,
  UserCheck,
  UserRound,
  Users,
  UsersRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { Resource } from '@/types'

export interface NavItem {
  resource: Resource
  label: string
  path: string
  icon: LucideIcon
  /** Used by the placeholder pages until the real module ships. */
  description: string
  /** Logical sidebar section header */
  section?: string
}

/** Sidebar order from the product spec. Each item is shown only if the role can `view` its resource. */
export const NAV_ITEMS: NavItem[] = [
  {
    resource: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Your sales performance at a glance.',
  },
  {
    resource: 'followups',
    label: 'Follow-ups',
    path: '/follow-ups',
    icon: CalendarClock,
    description: 'Everything due, overdue and upcoming.',
  },
  {
    resource: 'leads',
    label: 'Leads',
    path: '/leads',
    icon: UserRound,
    description: 'Capture, qualify and work every lead.',
  },
  {
    resource: 'pipeline',
    label: 'Pipeline',
    path: '/pipeline',
    icon: KanbanSquare,
    description: 'Move opportunities through your stages.',
  },
  {
    resource: 'deals',
    label: 'Deals',
    path: '/deals',
    icon: Handshake,
    description: 'Track value, probability and close dates.',
  },
  {
    resource: 'customers',
    label: 'Customers',
    path: '/customers',
    icon: Building2,
    description: 'Won leads and their full history.',
  },
  {
    resource: 'inbox',
    label: 'Inbox',
    path: '/inbox',
    icon: Inbox,
    description: 'WhatsApp, email and call conversations.',
  },
  {
    resource: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
    description: 'Your to-dos, grouped by urgency.',
  },
  {
    resource: 'campaigns',
    label: 'Campaigns',
    path: '/campaigns',
    icon: Megaphone,
    description: 'Spend, leads and revenue per campaign.',
  },
  {
    resource: 'automations',
    label: 'Automations',
    path: '/automations',
    icon: Workflow,
    description: 'Rules that run your sales process.',
  },
  {
    resource: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    description: 'Leads, sales and team performance.',
  },
  {
    resource: 'team',
    label: 'Team',
    path: '/team',
    icon: UsersRound,
    description: 'Members, roles and permissions.',
  },
  {
    resource: 'audit_logs',
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: ScrollText,
    description: 'Who changed what, and when.',
  },
  {
    resource: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Workspace, profile and configuration.',
  },
]

/** Specific sidebar items for Mentor role matching the unified navigation */
export const MENTOR_NAV_ITEMS: NavItem[] = [
  {
    resource: 'dashboard',
    label: 'Home',
    path: '/mentor/home',
    icon: Home,
    description: 'Mentor overview, today schedule and quick actions.',
  },
  {
    resource: 'reports',
    label: 'My Classes',
    path: '/mentor/classes',
    icon: BookOpen,
    description: 'Batch performance & module timeline.',
  },
  {
    resource: 'team',
    label: 'Students',
    path: '/mentor/students',
    icon: Users,
    description: 'Track assigned student progress.',
  },
  {
    resource: 'tasks',
    label: 'Attendance',
    path: '/mentor/attendance',
    icon: UserCheck,
    description: 'Log and track student attendance.',
  },
  {
    resource: 'tasks',
    label: 'Assignments',
    path: '/mentor/assignments',
    icon: FileText,
    description: 'Create and review student assignments.',
  },
  {
    resource: 'reports',
    label: 'Exams',
    path: '/mentor/exams',
    icon: Award,
    description: 'Schedule exams and manage grades.',
  },
  {
    resource: 'reports',
    label: 'Results',
    path: '/mentor/results',
    icon: BarChart3,
    description: 'Student grade and progress analytics.',
  },
  {
    resource: 'followups',
    label: 'Timetable',
    path: '/mentor/timetable',
    icon: Calendar,
    description: 'Weekly teaching timetable.',
  },
  {
    resource: 'inbox',
    label: 'Messages',
    path: '/mentor/messages',
    icon: MessageSquare,
    description: 'Direct student communications.',
  },
  {
    resource: 'inbox',
    label: 'Notifications',
    path: '/mentor/notifications',
    icon: Bell,
    description: 'System alerts and updates.',
  },
  {
    resource: 'team',
    label: 'Profile',
    path: '/mentor/profile',
    icon: User,
    description: 'Mentor profile and credentials.',
  },
  {
    resource: 'settings',
    label: 'Settings',
    path: '/mentor/settings',
    icon: Settings,
    description: 'Preferences and configuration.',
  },
]

export function getNavItem(resource: Resource): NavItem {
  const item = NAV_ITEMS.find((candidate) => candidate.resource === resource)
  if (!item) throw new Error(`No navigation item for resource "${resource}"`)
  return item
}

/** Resources pinned to the mobile bottom bar; everything else lives under "More". */
export const MOBILE_TAB_RESOURCES: Resource[] = ['dashboard', 'followups', 'leads', 'inbox']
