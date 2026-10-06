import { useFormContext } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { Textarea } from '@/components/ui'
import { MAX_INVITES, parseEmailList, type OnboardingValues } from '../schemas'

export function InviteStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingValues>()
  const count = parseEmailList(watch('inviteEmails')).length

  return (
    <FormField
      id="onboarding-invites"
      label="Teammate emails"
      hint={
        count > 0
          ? `${count} of ${MAX_INVITES} invites ready.`
          : 'Separate addresses with commas, spaces or new lines.'
      }
      error={errors.inviteEmails?.message}
    >
      {(control) => (
        <Textarea
          {...control}
          rows={4}
          placeholder="priya@company.com, arjun@company.com"
          {...register('inviteEmails')}
        />
      )}
    </FormField>
  )
}
