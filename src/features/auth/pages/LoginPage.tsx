import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your LeadFlow workspace."
      footer={
        <>
          New to LeadFlow?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create a workspace
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
