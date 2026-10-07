import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

export function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [absentAlerts, setAbsentAlerts] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#17324D] dark:text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Mentor Settings</h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          Manage your portal preferences, notification rules, and security
        </p>
      </div>

      {/* Preferences Container */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-5 space-y-6 shadow-2xs">
        {/* Section 1: Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
            <Bell className="size-4 text-[#0F9F83]" /> Notification Preferences
          </h3>

          <div className="space-y-3 divide-y divide-[#E2E8F0] dark:divide-border text-xs">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#17324D] dark:text-foreground">
                  Email Notifications for Submissions
                </div>
                <div className="text-[#64748B]">Receive email alerts whenever a student submits an assignment</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="size-4 accent-[#0F9F83] cursor-pointer"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#17324D] dark:text-foreground">
                  Consecutive Absence Alerts
                </div>
                <div className="text-[#64748B]">Notify when an assigned student is absent for 2+ consecutive days</div>
              </div>
              <input
                type="checkbox"
                checked={absentAlerts}
                onChange={(e) => setAbsentAlerts(e.target.checked)}
                className="size-4 accent-[#0F9F83] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[#E2E8F0] dark:border-border flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#0F9F83] hover:bg-[#0b7e67] text-white font-semibold h-10 px-5 text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="size-4" /> Preferences Saved!
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
