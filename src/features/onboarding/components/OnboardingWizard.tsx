import { useState, type FormEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormAlert } from '@/components/common/FormField'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Stepper,
  toast,
} from '@/components/ui'
import { DEFAULT_CURRENCY_CODE, detectTimezone } from '@/lib/locale-options'
import { getErrorMessage } from '@/services/api'
import { useAuthStore } from '@/store/auth-store'
import { useCompleteOnboarding } from '../hooks/use-complete-onboarding'
import { onboardingSchema, parseEmailList, type OnboardingValues } from '../schemas'
import { ONBOARDING_STEPS } from '../steps'
import { ImportStep } from './ImportStep'
import { InviteStep } from './InviteStep'
import { RegionStep } from './RegionStep'
import { WorkspaceStep } from './WorkspaceStep'

const stepComponents = [WorkspaceStep, RegionStep, ImportStep, InviteStep]
const LAST_STEP = ONBOARDING_STEPS.length - 1

export function OnboardingWizard() {
  const tenant = useAuthStore((state) => state.tenant)
  const navigate = useNavigate()
  const completeOnboarding = useCompleteOnboarding()
  const [stepIndex, setStepIndex] = useState(0)

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      workspaceName: tenant?.name ?? '',
      currency: tenant?.currency ?? DEFAULT_CURRENCY_CODE,
      timezone: tenant?.timezone ?? detectTimezone(),
      importChoice: 'skip',
      inviteEmails: '',
    },
  })

  const step = ONBOARDING_STEPS[stepIndex]
  const StepContent = stepComponents[stepIndex]
  const isLast = stepIndex === LAST_STEP

  const goNext = async () => {
    if (await form.trigger(step.fields)) setStepIndex((index) => Math.min(index + 1, LAST_STEP))
  }

  const finish = form.handleSubmit((values) =>
    completeOnboarding.mutate(
      {
        workspaceName: values.workspaceName,
        currency: values.currency,
        timezone: values.timezone,
        inviteEmails: parseEmailList(values.inviteEmails),
      },
      {
        onSuccess: () => {
          toast.success('Your workspace is ready')
          navigate('/dashboard', { replace: true })
        },
      },
    ),
  )

  // Pressing Enter inside a field submits the form; on early steps that should just advance.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLast) void finish()
    else void goNext()
  }

  const skip = () => {
    if (isLast) {
      form.setValue('inviteEmails', '')
      void finish()
    } else {
      form.setValue('importChoice', 'skip')
      setStepIndex((index) => index + 1)
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="gap-6">
        <Stepper
          steps={ONBOARDING_STEPS}
          currentStep={stepIndex}
          aria-label="Onboarding progress"
        />
        <div className="space-y-1">
          <CardTitle className="text-xl">{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </div>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {isLast && completeOnboarding.isError ? (
              <FormAlert title="Could not finish setup">
                {getErrorMessage(completeOnboarding.error)}
              </FormAlert>
            ) : null}
            <StepContent />
          </CardContent>
          <div className="flex items-center gap-2 border-t border-border p-4">
            <Button
              variant="ghost"
              onClick={() => setStepIndex((index) => index - 1)}
              disabled={stepIndex === 0 || completeOnboarding.isPending}
            >
              Back
            </Button>
            <div className="flex-1" />
            {step.skippable ? (
              <Button variant="outline" onClick={skip} disabled={completeOnboarding.isPending}>
                {isLast ? 'Skip and finish' : 'Skip'}
              </Button>
            ) : null}
            <Button type="submit" loading={completeOnboarding.isPending}>
              {isLast ? 'Finish setup' : 'Continue'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  )
}
