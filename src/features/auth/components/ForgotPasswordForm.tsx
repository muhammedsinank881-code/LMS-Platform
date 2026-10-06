import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormAlert, FormField } from '@/components/common/FormField'
import { Button, Input } from '@/components/ui'
import { getErrorMessage } from '@/services/api'
import { useForgotPassword } from '../hooks/use-auth-mutations'
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas'

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  if (forgotPassword.isSuccess) {
    return (
      <FormAlert tone="success" title="Check your inbox">
        If an account exists for <strong>{forgotPassword.variables.email}</strong>, we have sent a
        link to reset your password.
      </FormAlert>
    )
  }

  return (
    <form
      onSubmit={handleSubmit((values) => forgotPassword.mutate(values))}
      noValidate
      className="space-y-4"
    >
      {forgotPassword.isError ? (
        <FormAlert title="Could not send the link">
          {getErrorMessage(forgotPassword.error)}
        </FormAlert>
      ) : null}

      <FormField id="forgot-email" label="Email" required error={errors.email?.message}>
        {(control) => (
          <Input {...control} type="email" autoComplete="email" {...register('email')} />
        )}
      </FormField>

      <Button type="submit" size="lg" className="w-full" loading={forgotPassword.isPending}>
        Send reset link
      </Button>
    </form>
  )
}
