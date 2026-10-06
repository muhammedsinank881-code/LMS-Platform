import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormAlert, FormField } from '@/components/common/FormField'
import { Button, Input } from '@/components/ui'
import { getErrorMessage, type InvitationDetails } from '@/services/api'
import { useAcceptInvite } from '../hooks/use-auth-mutations'
import { acceptInviteSchema, type AcceptInviteValues } from '../schemas'
import { PasswordInput } from './PasswordInput'

export interface AcceptInviteFormProps {
  invitation: InvitationDetails
}

export function AcceptInviteForm({ invitation }: AcceptInviteFormProps) {
  const acceptInvite = useAcceptInvite()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { name: '', password: '', confirmPassword: '' },
  })

  // This route is not wrapped in PublicOnlyRoute (a signed-in user may open an invite), so navigate explicitly.
  const onSubmit = ({ name, password }: AcceptInviteValues) =>
    acceptInvite.mutate(
      { token: invitation.token, name, password },
      { onSuccess: () => navigate('/dashboard', { replace: true }) },
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {acceptInvite.isError ? (
        <FormAlert title="Could not accept the invitation">
          {getErrorMessage(acceptInvite.error)}
        </FormAlert>
      ) : null}

      <FormField id="invite-email" label="Email">
        {(control) => <Input {...control} value={invitation.email} readOnly disabled />}
      </FormField>

      <FormField id="invite-name" label="Your name" required error={errors.name?.message}>
        {(control) => <Input {...control} autoComplete="name" {...register('name')} />}
      </FormField>

      <FormField id="invite-password" label="Password" required error={errors.password?.message}>
        {(control) => (
          <PasswordInput {...control} autoComplete="new-password" {...register('password')} />
        )}
      </FormField>

      <FormField
        id="invite-confirm"
        label="Confirm password"
        required
        error={errors.confirmPassword?.message}
      >
        {(control) => (
          <PasswordInput
            {...control}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        )}
      </FormField>

      <Button type="submit" size="lg" className="w-full" loading={acceptInvite.isPending}>
        Join {invitation.tenantName}
      </Button>
    </form>
  )
}
