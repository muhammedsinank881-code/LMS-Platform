import { MailX } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, EmptyState, Skeleton } from '@/components/ui'
import { getErrorMessage } from '@/services/api'
import { AcceptInviteForm } from '../components/AcceptInviteForm'
import { AuthLayout } from '../components/AuthLayout'
import { useInvitation } from '../hooks/use-invitation'

const INVITE_TOKEN_PARAM = 'token'

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get(INVITE_TOKEN_PARAM)
  const invitation = useInvitation(token)

  if (!token || invitation.isError) {
    return (
      <AuthLayout title="Accept invitation">
        <EmptyState
          tone="destructive"
          icon={MailX}
          title="Invitation unavailable"
          description={
            token
              ? getErrorMessage(invitation.error, 'This invitation link is invalid or has expired.')
              : 'This page needs an invitation link. Open the link from your invitation email.'
          }
          action={
            <Button asChild variant="outline">
              <Link to="/login">Go to sign in</Link>
            </Button>
          }
        />
      </AuthLayout>
    )
  }

  if (!invitation.data) {
    return (
      <AuthLayout title="Accept invitation" description="Loading your invitation…">
        <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading invitation">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </AuthLayout>
    )
  }

  const { tenantName, invitedByName } = invitation.data
  return (
    <AuthLayout
      title={`Join ${tenantName}`}
      description={`${invitedByName} invited you to collaborate. Set up your account to get started.`}
    >
      <AcceptInviteForm invitation={invitation.data} />
    </AuthLayout>
  )
}
