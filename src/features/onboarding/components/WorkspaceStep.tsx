import { useFormContext } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { Input } from '@/components/ui'
import type { OnboardingValues } from '../schemas'

export function WorkspaceStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingValues>()

  return (
    <FormField
      id="onboarding-workspace"
      label="Workspace name"
      required
      error={errors.workspaceName?.message}
    >
      {(control) => (
        <Input {...control} autoComplete="organization" {...register('workspaceName')} />
      )}
    </FormField>
  )
}
