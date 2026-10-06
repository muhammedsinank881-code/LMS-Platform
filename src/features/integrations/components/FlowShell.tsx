import type { ReactNode } from 'react'
import { Button, DrawerBody, DrawerFooter, Stepper, type StepperStep } from '@/components/ui'

/** Stepper, body and Back / Next footer shared by every connection flow. Full screen inside a mobile drawer. */
export function FlowShell({
  steps,
  current,
  children,
  canNext = true,
  nextLabel = 'Next',
  loading = false,
  hideNext = false,
  onNext,
  onBack,
  onCancel,
}: {
  steps: StepperStep[]
  current: number
  children: ReactNode
  canNext?: boolean
  nextLabel?: string
  loading?: boolean
  hideNext?: boolean
  onNext: () => void
  onBack: () => void
  onCancel: () => void
}) {
  return (
    <>
      <DrawerBody className="space-y-6">
        <Stepper steps={steps} currentStep={current} aria-label="Connection steps" />
        <section aria-label={steps[current]?.label} className="space-y-4">{children}</section>
      </DrawerBody>
      <DrawerFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        {current > 0 ? <Button variant="outline" disabled={loading} onClick={onBack}>Back</Button> : null}
        {hideNext ? null : <Button disabled={!canNext} loading={loading} onClick={onNext}>{nextLabel}</Button>}
      </DrawerFooter>
    </>
  )
}
