import { useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Stepper,
  toast,
} from '@/components/ui'
import { useTemplates } from '@/features/inbox/hooks/use-templates'
import { useCustomFields } from '@/features/settings/hooks/use-settings'
import { useAudienceCount, useBroadcastPreview, useCreateBroadcast } from '../../hooks/use-broadcasts'
import {
  INITIAL_WIZARD,
  WIZARD_STEPS,
  stepError,
  toBroadcastInput,
  type WizardState,
} from '../../lib/broadcast-wizard'
import { StepAudience, StepConfirm, StepPreview, StepSchedule, StepTemplate, StepVariables } from './WizardSteps'

function Wizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD)
  const templates = useTemplates()
  const fields = useCustomFields()
  const create = useCreateBroadcast()
  const approved = (templates.data ?? []).filter((t) => t.channel === 'whatsapp' && t.status === 'approved')
  const template = approved.find((t) => t.id === state.templateId)
  const customKeys = (fields.data ?? []).filter((f) => f.entity === 'lead' && f.archived !== true).map((f) => f.key)
  const count = useAudienceCount(state.audience)
  const preview = useBroadcastPreview(step === 3 ? state.templateId : null, state.variableMap, state.audience)
  const patch = (next: Partial<WizardState>) => setState((current) => ({ ...current, ...next }))
  const blocked = stepError(step, state, template, count.data, customKeys, new Date())
  const last = step === WIZARD_STEPS.length - 1

  const finish = () => {
    const input = toBroadcastInput(state)
    if (!input) return
    create.mutate(input, {
      onSuccess: (broadcast) => {
        toast.success(broadcast.status === 'scheduled' ? 'Broadcast scheduled' : 'Broadcast sending')
        onDone()
      },
    })
  }

  return (
    <>
      <ModalBody className="space-y-5">
        <Stepper steps={[...WIZARD_STEPS]} currentStep={step} aria-label="New broadcast steps" />
        <div aria-live="polite" className="min-h-[12rem]">
          {step === 0 ? <StepTemplate templates={approved} state={state} customKeys={customKeys} onChange={patch} /> : null}
          {step === 1 ? <StepAudience state={state} count={count.data} countLoading={count.isLoading} onChange={patch} /> : null}
          {step === 2 ? <StepVariables template={template} state={state} customKeys={customKeys} onChange={patch} /> : null}
          {step === 3 ? <StepPreview preview={preview.data} isLoading={preview.isLoading} template={template} /> : null}
          {step === 4 ? <StepSchedule state={state} onChange={patch} /> : null}
          {step === 5 ? <StepConfirm state={state} template={template} count={count.data} onChange={patch} /> : null}
        </div>
        {blocked ? <p className="text-xs text-muted-foreground" role="status">{blocked}</p> : null}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={step === 0 ? onDone : () => setStep(step - 1)}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {last ? (
          <Button disabled={blocked !== null} loading={create.isPending} onClick={finish}>
            {state.mode === 'now' ? 'Send broadcast' : 'Schedule broadcast'}
          </Button>
        ) : (
          <Button disabled={blocked !== null} onClick={() => setStep(step + 1)}>Next</Button>
        )}
      </ModalFooter>
    </>
  )
}

export function BroadcastWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl">
        <ModalHeader>
          <ModalTitle>New WhatsApp broadcast</ModalTitle>
          <ModalDescription>Pick an approved template and an audience. Opted-out leads are never messaged.</ModalDescription>
        </ModalHeader>
        {open ? <Wizard onDone={() => onOpenChange(false)} /> : null}
      </ModalContent>
    </Modal>
  )
}
