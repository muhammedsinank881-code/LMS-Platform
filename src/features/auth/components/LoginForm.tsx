import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FormAlert, FormField } from '@/components/common/FormField'
import { Button, Input } from '@/components/ui'
import { getErrorMessage } from '@/services/api'
import { useLogin } from '../hooks/use-auth-mutations'
import { loginSchema, type LoginValues } from '../schemas'
import { PasswordInput } from './PasswordInput'

/** Signing in sets the session; `PublicOnlyRoute` then performs the redirect-after-login. */
export function LoginForm() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => login.mutate(values))}
      noValidate
      className="space-y-4"
    >
      {login.isError ? (
        <FormAlert title="Could not sign in">{getErrorMessage(login.error)}</FormAlert>
      ) : null}

      <FormField id="login-email" label="Email" required error={errors.email?.message}>
        {(control) => (
          <Input {...control} type="email" autoComplete="email" {...register('email')} />
        )}
      </FormField>

      <FormField id="login-password" label="Password" required error={errors.password?.message}>
        {(control) => (
          <PasswordInput {...control} autoComplete="current-password" {...register('password')} />
        )}
      </FormField>

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        Sign in
      </Button>

      {import.meta.env.DEV ? (
        <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          Demo accounts, password <code>password123</code>: <code>mentor@leadflow.test</code>,{' '}
          <code>super@leadflow.test</code>, <code>admin@leadflow.test</code>,{' '}
          <code>manager@leadflow.test</code>, <code>sales@leadflow.test</code>
        </p>
      ) : null}
    </form>
  )
}
