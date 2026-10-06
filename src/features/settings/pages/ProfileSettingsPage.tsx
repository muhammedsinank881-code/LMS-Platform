import { useCallback, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { queryBlocked } from '@/components/common/query-blocked'
import { NoAccess } from '@/components/common/NoAccess'
import { NotificationPreferencesPanel } from '@/features/notifications/components/NotificationPreferencesPanel'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/features/notifications/hooks/use-notification-actions'
import { useMember } from '@/features/team/hooks/use-team'
import { Button, Input, Select, toast } from '@/components/ui'
import { defaultNotificationPreferences } from '@/lib/notification-prefs'
import { usePermission } from '@/hooks/use-permission'
import { useAuthStore } from '@/store/auth-store'
import { SectionIntro } from '../components/SettingsLayout'
import { useRegisterSave } from '../components/use-save-bar'
import { useUpdateProfile } from '../hooks/use-settings'
import { passwordSchema, profileSchema, type PasswordValues, type ProfileValues } from '../schemas'

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu'].map((value) => ({ value, label: value }))
const ZONES = ['Asia/Kolkata', 'Asia/Dubai', 'UTC', 'America/New_York'].map((value) => ({ value, label: value }))

export function ProfileSettingsPage() {
  const { canSection } = usePermission()
  const userId = useAuthStore((state) => state.user?.id)
  const member = useMember(userId)
  const save = useUpdateProfile()
  const prefs = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: member.data?.name ?? '',
      phone: member.data?.phone ?? '',
      language: member.data?.language ?? 'English',
      timezone: member.data?.timezone ?? 'Asia/Kolkata',
    },
  })
  const dirty = form.formState.isDirty
  const submit = useCallback(() => {
    void form.handleSubmit((values) =>
      save.mutate(values, {
        onSuccess: () => {
          form.reset(values)
          toast.success('Profile saved')
        },
      }),
    )()
  }, [form, save])
  const discard = useCallback(() => form.reset(), [form])
  const registration = useMemo(
    () => (dirty ? { dirty: true, saving: save.isPending, save: submit, discard } : null),
    [dirty, discard, save.isPending, submit],
  )
  useRegisterSave(registration)
  if (!canSection('profile')) return <NoAccess />
  const memberBlocked = queryBlocked(member)
  const prefsBlocked = queryBlocked(prefs)
  if (memberBlocked) return memberBlocked
  return (
    <div className="space-y-8">
      <SectionIntro title="Profile" description="How you appear to the rest of the workspace." />
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <FormField id="profile-name" label="Name" error={form.formState.errors.name?.message}>
          {(control) => <Input {...control} {...form.register('name')} />}
        </FormField>
        <FormField id="profile-email" label="Email">
          {(control) => <Input {...control} value={member.data?.email ?? ''} readOnly />}
        </FormField>
        <FormField id="profile-phone" label="Phone">
          {(control) => <Input {...control} type="tel" inputMode="tel" autoComplete="tel" {...form.register('phone')} />}
        </FormField>
        <FormField id="profile-language" label="Language">
          {(control) => (
            <Select {...control} options={LANGUAGES} value={form.watch('language')} onValueChange={(value) => form.setValue('language', value, { shouldDirty: true })} />
          )}
        </FormField>
        <FormField id="profile-timezone" label="Timezone">
          {(control) => (
            <Select {...control} options={ZONES} value={form.watch('timezone')} onValueChange={(value) => form.setValue('timezone', value, { shouldDirty: true })} />
          )}
        </FormField>
        <AvatarField
          value={member.data?.avatarUrl ?? null}
          onChange={(avatarUrl) => save.mutate({ avatarUrl }, { onSuccess: () => toast.success('Photo updated') })}
        />
      </form>
      <PasswordForm />
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {prefsBlocked ?? (
          <NotificationPreferencesPanel
            value={prefs.data ?? defaultNotificationPreferences()}
            onChange={(next) => updatePrefs.mutate(next)}
          />
        )}
      </section>
    </div>
  )
}

function AvatarField({ value, onChange }: { value: string | null; onChange: (value: string) => void }) {
  return (
    <FormField id="profile-avatar" label="Photo" className="sm:col-span-2">
      {(control) => (
        <div className="flex items-center gap-3">
          {value ? <img src={value} alt="" width={48} height={48} loading="lazy" className="h-12 w-12 rounded-full object-cover" /> : null}
          <Input
            {...control}
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => onChange(String(reader.result))
              reader.readAsDataURL(file)
            }}
          />
        </div>
      )}
    </FormField>
  )
}

function PasswordForm() {
  const form = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', nextPassword: '', confirmPassword: '' } })
  const [note, setNote] = useState('')
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit(() => setNote('Checked only. Passwords are not stored in this preview.'))}
    >
      <h3 className="text-sm font-semibold sm:col-span-2">Change password</h3>
      <FormField id="pw-current" label="Current password" error={form.formState.errors.currentPassword?.message}>
        {(c) => <Input {...c} type="password" {...form.register('currentPassword')} />}
      </FormField>
      <FormField id="pw-next" label="New password" error={form.formState.errors.nextPassword?.message}>
        {(c) => <Input {...c} type="password" {...form.register('nextPassword')} />}
      </FormField>
      <FormField id="pw-confirm" label="Confirm password" error={form.formState.errors.confirmPassword?.message}>
        {(c) => <Input {...c} type="password" {...form.register('confirmPassword')} />}
      </FormField>
      <div className="sm:col-span-2">
        <Button type="submit">Check password</Button>
        {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
      </div>
    </form>
  )
}
