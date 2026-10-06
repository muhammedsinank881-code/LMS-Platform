import {
  Bell,
  CheckSquare,
  Mail,
  MessageCircle,
  MonitorPlay,
  Phone,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { FollowUpType } from '@/types'

export interface FollowUpTypeMeta {
  label: string
  icon: LucideIcon
  chip: string
}

export const FOLLOW_UP_TYPE_META: Record<FollowUpType, FollowUpTypeMeta> = {
  call: { label: 'Call', icon: Phone, chip: 'border-primary bg-primary/10' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, chip: 'border-success bg-success/10' },
  email: { label: 'Email', icon: Mail, chip: 'border-info bg-info/10' },
  meeting: { label: 'Meeting', icon: Users, chip: 'border-warning bg-warning/20' },
  demo: { label: 'Demo', icon: MonitorPlay, chip: 'border-primary bg-primary/5' },
  reminder: { label: 'Reminder', icon: Bell, chip: 'border-muted-foreground bg-muted' },
  task: { label: 'Task', icon: CheckSquare, chip: 'border-foreground/30 bg-muted' },
}

export const REMINDER_OPTIONS = [
  { value: 'none', label: 'No reminder' },
  { value: '0', label: 'At time' },
  { value: '15', label: '15 min before' },
  { value: '60', label: '1 hour before' },
  { value: '1440', label: '1 day before' },
] as const
