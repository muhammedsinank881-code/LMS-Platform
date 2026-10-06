// Brand icons are not in lucide-react, so social providers use the same stand-ins as lead sources.
import { Briefcase, Camera, Globe, Mail, MessageCircle, Phone, Search, Share2, type LucideIcon } from 'lucide-react'
import type { IntegrationProvider, IntegrationStatus } from '@/types'

export interface ProviderMeta {
  icon: LucideIcon
  description: string
  /** What stops when it is disconnected, shown in the confirm dialog. */
  stops: string
}

export const PROVIDER_META: Record<IntegrationProvider, ProviderMeta> = {
  whatsapp: { icon: MessageCircle, description: 'Message leads from the Inbox and receive their replies, with approved templates.', stops: 'You can no longer send or receive WhatsApp messages here, and new WhatsApp leads stop arriving. Existing conversations are kept.' },
  email: { icon: Mail, description: 'Send and track email from the CRM using your own address and signature.', stops: 'Emails can no longer be sent from LeadFlow, and open and click tracking stops. Sent emails stay on the timeline.' },
  facebook_lead_ads: { icon: Share2, description: 'Pull leads from Facebook lead forms straight into your pipeline, mapped and assigned.', stops: 'New Facebook form submissions are no longer imported. Leads already imported are kept.' },
  instagram: { icon: Camera, description: 'Capture leads from Instagram lead ads the moment they are submitted.', stops: 'New Instagram form submissions are no longer imported. Leads already imported are kept.' },
  google_ads: { icon: Search, description: 'Receive lead form extension leads and sync campaign spend for accurate CPL and ROAS.', stops: 'Google lead forms stop importing and spend no longer syncs. Existing leads and spend entries are kept.' },
  linkedin: { icon: Briefcase, description: 'Bring in LinkedIn Lead Gen Form leads for B2B campaigns.', stops: 'New LinkedIn form submissions are no longer imported. Leads already imported are kept.' },
  telephony: { icon: Phone, description: 'Click to call, and log every call against the lead automatically.', stops: 'Click-to-call and automatic call logging stop. Call logs already saved are kept.' },
  website: { icon: Globe, description: 'Track visitors on your site and attribute leads to the pages and campaigns they came from.', stops: 'Website tracking stops, so new visits and page activity no longer reach lead scoring.' },
}

export const STATUS_LABEL: Record<IntegrationStatus, string> = {
  not_connected: 'Not connected',
  connecting: 'Connecting',
  connected: 'Connected',
  error: 'Error',
  expired: 'Expired',
}

export const STATUS_TONE: Record<IntegrationStatus, 'neutral' | 'info' | 'success' | 'destructive' | 'warning'> = {
  not_connected: 'neutral',
  connecting: 'info',
  connected: 'success',
  error: 'destructive',
  expired: 'warning',
}
