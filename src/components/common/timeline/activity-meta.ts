import {
  ArrowRightLeft,
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  FileText,
  Gauge,
  GitMerge,
  Mail,
  MessageCircle,
  Phone,
  Presentation,
  RefreshCw,
  Sparkles,
  StickyNote,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ActivityType, CallOutcome } from '@/types'

export interface ActivityMeta {
  label: string
  icon: LucideIcon
  tone: string
}

export const ACTIVITY_META: Record<ActivityType, ActivityMeta> = {
  lead_created: { label: 'Lead created', icon: Sparkles, tone: 'bg-muted text-muted-foreground' },
  assigned: { label: 'Assigned', icon: UserPlus, tone: 'bg-muted text-muted-foreground' },
  reassigned: { label: 'Reassigned', icon: ArrowRightLeft, tone: 'bg-muted text-muted-foreground' },
  status_changed: { label: 'Status changed', icon: RefreshCw, tone: 'bg-warning/15 text-warning' },
  note: { label: 'Note', icon: StickyNote, tone: 'bg-primary/10 text-primary' },
  call: { label: 'Call', icon: Phone, tone: 'bg-info/10 text-info' },
  whatsapp_sent: { label: 'WhatsApp sent', icon: MessageCircle, tone: 'bg-success/10 text-success' },
  whatsapp_received: { label: 'WhatsApp received', icon: MessageCircle, tone: 'bg-success/10 text-success' },
  email_sent: { label: 'Email sent', icon: Mail, tone: 'bg-success/10 text-success' },
  email_received: { label: 'Email received', icon: Mail, tone: 'bg-success/10 text-success' },
  followup_scheduled: { label: 'Follow-up scheduled', icon: CalendarClock, tone: 'bg-muted text-muted-foreground' },
  followup_completed: { label: 'Follow-up completed', icon: CalendarCheck, tone: 'bg-muted text-muted-foreground' },
  meeting: { label: 'Meeting', icon: Users, tone: 'bg-primary/10 text-primary' },
  demo: { label: 'Demo', icon: Presentation, tone: 'bg-primary/10 text-primary' },
  quotation_sent: { label: 'Quotation sent', icon: FileText, tone: 'bg-primary/10 text-primary' },
  score_changed: { label: 'Score changed', icon: Gauge, tone: 'bg-muted text-muted-foreground' },
  merged: { label: 'Merged', icon: GitMerge, tone: 'bg-muted text-muted-foreground' },
  converted: { label: 'Converted', icon: BadgeCheck, tone: 'bg-success/10 text-success' },
  stage_changed: { label: 'Stage changed', icon: ArrowRightLeft, tone: 'bg-primary/10 text-primary' },
}

export const CALL_OUTCOME_LABEL: Record<CallOutcome, string> = {
  connected: 'Connected',
  no_answer: 'No answer',
  busy: 'Busy',
  voicemail: 'Voicemail',
  wrong_number: 'Wrong number',
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.round(seconds / 60)
  return `${minutes} min`
}
