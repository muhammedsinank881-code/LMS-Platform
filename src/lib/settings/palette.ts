import type { LucideIcon } from 'lucide-react'
import { Building2, MapPin, Megaphone, Star, Tag, UserRound } from 'lucide-react'
import { getSourceIcon } from '@/lib/source-icon'

/** Preset colors taken from the status and stage seed. */
export const COLOR_PRESETS = [
  '#6366f1',
  '#0ea5e9',
  '#14b8a6',
  '#22c55e',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#64748b',
] as const

const SOURCE_NAMES = [
  'Globe',
  'MessageCircle',
  'Facebook',
  'Instagram',
  'Search',
  'Linkedin',
  'PenLine',
  'Phone',
  'Mail',
  'LayoutTemplate',
  'Upload',
  'Plug',
] as const

const EXTRA: { name: string; icon: LucideIcon }[] = [
  { name: 'Tag', icon: Tag },
  { name: 'UserRound', icon: UserRound },
  { name: 'Building2', icon: Building2 },
  { name: 'MapPin', icon: MapPin },
  { name: 'Star', icon: Star },
  { name: 'Megaphone', icon: Megaphone },
]

export const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  ...SOURCE_NAMES.map((name) => ({ name, icon: getSourceIcon(name) })),
  ...EXTRA,
]

export function iconByName(name: string): LucideIcon {
  return ICON_OPTIONS.find((option) => option.name === name)?.icon ?? getSourceIcon(name)
}
