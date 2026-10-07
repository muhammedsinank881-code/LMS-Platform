import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'

export function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [absentAlerts, setAbsentAlerts] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <PageHeader
        title="Mentor Settings"
        description="Manage your portal preferences, notification rules, and security"
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Settings' },
        ]}
      />

      {/* Preferences Container */}
      <Card className="p-5 space-y-6">
        {/* Section 1: Notifications */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Bell className="size-4 text-primary" /> Notification Preferences
          </h3>

          <div className="space-y-3 divide-y divide-border text-xs">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">
                  Email Notifications for Submissions
                </div>
                <div className="text-muted-foreground">Receive email alerts whenever a student submits an assignment</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="size-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">
                  Consecutive Absence Alerts
                </div>
                <div className="text-muted-foreground">Notify when an assigned student is absent for 2+ consecutive days</div>
              </div>
              <input
                type="checkbox"
                checked={absentAlerts}
                onChange={(e) => setAbsentAlerts(e.target.checked)}
                className="size-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-border flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            className="h-10 px-5"
          >
            {savedSuccess ? (
              <>
                <Check className="size-4 mr-1.5" /> Preferences Saved!
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export const Settings = SettingsPage
export default SettingsPage
