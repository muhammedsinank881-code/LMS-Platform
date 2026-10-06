import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormAlert, FormField } from '@/components/common/FormField'
import { Button, Input } from '@/components/ui'
import { getErrorMessage } from '@/services/api'
import { useRegister } from '../hooks/use-auth-mutations'
import { registerSchema, type RegisterValues } from '../schemas'
import { PasswordInput } from './PasswordInput'

/** Creates the account and a new workspace; the guards then send the user to onboarding. */
export function RegisterForm() {
  const registerUser = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', workspaceName: '', email: '', password: '' },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => registerUser.mutate(values))}
      noValidate
      className="space-y-4"
    >
      {registerUser.isError ? (
        <FormAlert title="Could not create your account">
          {getErrorMessage(registerUser.error)}
        </FormAlert>
      ) : null}

      <FormField id="register-name" label="Your name" required error={errors.name?.message}>
        {(control) => <Input {...control} autoComplete="name" {...register('name')} />}
      </FormField>

      <FormField
        id="register-workspace"
        label="Workspace name"
        required
        hint="Your company or team, e.g. Acme Digital."
        error={errors.workspaceName?.message}
      >
        {(control) => (
          <Input {...control} autoComplete="organization" {...register('workspaceName')} />
        )}
      </FormField>

      <FormField id="register-email" label="Work email" required error={errors.email?.message}>
        {(control) => (
          <Input {...control} type="email" autoComplete="email" {...register('email')} />
        )}
      </FormField>

      <FormField
        id="register-password"
        label="Password"
        required
        hint="At least 8 characters."
        error={errors.password?.message}
      >
        {(control) => (
          <PasswordInput {...control} autoComplete="new-password" {...register('password')} />
        )}
      </FormField>

      <Button type="submit" size="lg" className="w-full" loading={registerUser.isPending}>
        Create workspace
      </Button>
    </form>
  )
}
