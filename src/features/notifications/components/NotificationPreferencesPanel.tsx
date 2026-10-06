import { Label, Switch } from '@/components/ui'
import { NOTIFICATION_GROUPS, type NotificationPreferences, type NotificationType } from '@/types'

const TYPE_LABELS: Record<NotificationType, string> = {
  lead_assigned: 'New lead assigned',
  followup_due: 'Follow-up due soon',
  followup_overdue: 'Follow-up overdue',
  whatsapp_reply: 'WhatsApp reply',
  email_received: 'New email',
  lead_uncontacted: 'Lead not contacted',
  leads_overdue: 'Leads overdue',
  response_time_increased: 'Response time increased',
  deal_won: 'Deal won',
  deal_lost: 'Deal lost',
  import_finished: 'Import finished',
  merge_completed: 'Merge completed',
  mention: 'Mention',
  automation_alert: 'Automation alert',
  automation_failed: 'Automation failed or paused',
  integration_alert: 'Integration or webhook problem',
  form_submission: 'Lead form submitted',
}

const GROUP_LABELS: Record<keyof typeof NOTIFICATION_GROUPS, string> = {
  leads: 'Leads',
  followups: 'Follow-ups',
  messages: 'Messages',
  deals: 'Deals',
  system: 'System',
}

export function NotificationPreferencesPanel({
  value,
  onChange,
}: {
  value: NotificationPreferences
  onChange: (next: NotificationPreferences) => void
}) {
  const setChannel = (type: NotificationType, key: 'inApp' | 'email' | 'push', checked: boolean) => {
    onChange({
      ...value,
      channels: value.channels.map((channel) => (channel.type === type ? { ...channel, [key]: checked } : channel)),
    })
  }

  return (
    <div className="space-y-3">
      {(Object.keys(NOTIFICATION_GROUPS) as Array<keyof typeof NOTIFICATION_GROUPS>).map((group) => (
        <section key={group}>
          <h3 className="mb-2 text-sm font-medium">{GROUP_LABELS[group]}</h3>
          <ul className="divide-y divide-border rounded-md border border-border">
            {NOTIFICATION_GROUPS[group].map((type) => {
              const channel = value.channels.find((item) => item.type === type)
              return (
                <li key={type} className="grid grid-cols-1 gap-2 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center">
                  <span className="text-sm">{TYPE_LABELS[type]}</span>
                  <Label className="flex items-center gap-2 text-xs">
                    In-app
                    <Switch size="sm" checked={channel?.inApp ?? true} onCheckedChange={(checked) => setChannel(type, 'inApp', checked)} aria-label={`${TYPE_LABELS[type]} in app`} />
                  </Label>
                  <Label className="flex items-center gap-2 text-xs">
                    Email
                    <Switch size="sm" checked={channel?.email ?? false} onCheckedChange={(checked) => setChannel(type, 'email', checked)} aria-label={`${TYPE_LABELS[type]} email`} />
                  </Label>
                  <Label className="flex items-center gap-2 text-xs">
                    Push
                    <Switch size="sm" checked={channel?.push ?? false} onCheckedChange={(checked) => setChannel(type, 'push', checked)} aria-label={`${TYPE_LABELS[type]} push`} />
                  </Label>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <section className="flex flex-wrap items-end gap-2">
        <Label className="flex items-center gap-2">
          Quiet hours
          <Switch
            checked={value.quietHours.enabled}
            onCheckedChange={(enabled) => onChange({ ...value, quietHours: { ...value.quietHours, enabled } })}
            aria-label="Quiet hours"
          />
        </Label>
        <label className="text-sm">
          From
          <input
            type="time"
            value={value.quietHours.start}
            onChange={(event) => onChange({ ...value, quietHours: { ...value.quietHours, start: event.target.value } })}
            className="ml-2 rounded-md border border-input bg-surface px-2 py-1"
            aria-label="Quiet hours start"
          />
        </label>
        <label className="text-sm">
          To
          <input
            type="time"
            value={value.quietHours.end}
            onChange={(event) => onChange({ ...value, quietHours: { ...value.quietHours, end: event.target.value } })}
            className="ml-2 rounded-md border border-input bg-surface px-2 py-1"
            aria-label="Quiet hours end"
          />
        </label>
      </section>
      <p className="text-xs text-muted-foreground">Email and push are saved for later. Only in-app notifications are delivered in this version.</p>
    </div>
  )
}
