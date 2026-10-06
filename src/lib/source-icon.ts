import {
  Briefcase,
  Camera,
  Globe,
  LayoutTemplate,
  Mail,
  MessageCircle,
  PenLine,
  Phone,
  Plug,
  Search,
  Share2,
  Upload,
  type LucideIcon,
} from 'lucide-react'

/** Brand icons are not in lucide-react; social sources use a nearby generic icon. */
const ICONS: Record<string, LucideIcon> = {
  Facebook: Share2,
  Globe,
  Instagram: Camera,
  LayoutTemplate,
  Linkedin: Briefcase,
  Mail,
  MessageCircle,
  PenLine,
  Phone,
  Plug,
  Search,
  Share2,
  Upload,
  Camera,
  Briefcase,
}

/** Resolves a `LeadSource.icon` lucide name. Unknown names fall back to Globe. */
export function getSourceIcon(name: string): LucideIcon {
  return ICONS[name] ?? Globe
}
