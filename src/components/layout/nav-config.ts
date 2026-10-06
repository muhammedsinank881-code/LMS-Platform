import {
  BarChart3,
  Building2,
  CalendarClock,
  CheckSquare,
  Handshake,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  UserRound,
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

export function getNavItem(resource: Resource): NavItem {
  const item = NAV_ITEMS.find((candidate) => candidate.resource === resource)
  if (!item) throw new Error(`No navigation item for resource "${resource}"`)
  return item
}

/** Resources pinned to the mobile bottom bar; everything else lives under "More". */
export const MOBILE_TAB_RESOURCES: Resource[] = ['dashboard', 'followups', 'leads', 'inbox']
