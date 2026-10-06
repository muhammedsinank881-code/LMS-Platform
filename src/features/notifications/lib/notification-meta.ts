import {
  AlertTriangle,
  AtSign,
  Workflow,
  CalendarClock,
  GitMerge,
  Hourglass,
  LineChart,
  Mail,
  MessageCircle,
  Trophy,
  Upload,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { NotificationGroup, NotificationType } from '@/types'

export interface NotificationMeta {
  icon: LucideIcon
  /** Icon chip colours. Semantic colours only where they carry meaning (overdue, won, lost). */
  tone: string
  label: string
}

const NEUTRAL = 'bg-muted text-muted-foreground'

export const NOTIFICATION_META: Record<NotificationType, NotificationMeta> = {
  lead_assigned: { icon: UserPlus, tone: 'bg-primary/10 text-primary', label: 'New lead' },
  followup_due: { icon: CalendarClock, tone: 'bg-warning/15 text-warning', label: 'Follow-up due' },
  followup_overdue: { icon: AlertTriangle, tone: 'bg-destructive/10 text-destructive', label: 'Overdue' },
  whatsapp_reply: { icon: MessageCircle, tone: 'bg-success/10 text-success', label: 'WhatsApp' },
  email_received: { icon: Mail, tone: 'bg-info/10 text-info', label: 'Email' },
  lead_uncontacted: { icon: Hourglass, tone: 'bg-warning/15 text-warning', label: 'Uncontacted' },
  leads_overdue: { icon: AlertTriangle, tone: 'bg-destructive/10 text-destructive', label: 'Overdue leads' },
  response_time_increased: { icon: LineChart, tone: NEUTRAL, label: 'Response time' },
  deal_won: { icon: Trophy, tone: 'bg-success/10 text-success', label: 'Deal won' },
  deal_lost: { icon: XCircle, tone: 'bg-destructive/10 text-destructive', label: 'Deal lost' },
  import_finished: { icon: Upload, tone: NEUTRAL, label: 'Import' },
  merge_completed: { icon: GitMerge, tone: NEUTRAL, label: 'Merge' },
  mention: { icon: AtSign, tone: 'bg-primary/10 text-primary', label: 'Mention' },
  automation_alert: { icon: Workflow, tone: 'bg-primary/10 text-primary', label: 'Automation' },
  automation_failed: { icon: AlertTriangle, tone: 'bg-destructive/10 text-destructive', label: 'Automation failed' },
  integration_alert: { icon: AlertTriangle, tone: 'bg-destructive/10 text-destructive', label: 'Integration' },
  form_submission: { icon: UserPlus, tone: 'bg-primary/10 text-primary', label: 'Form' },
}

export const NOTIFICATION_GROUP_LABEL: Record<NotificationGroup, string> = {
  leads: 'Leads',
  followups: 'Follow-ups',
  messages: 'Messages',
  deals: 'Deals',
  system: 'System',
}
