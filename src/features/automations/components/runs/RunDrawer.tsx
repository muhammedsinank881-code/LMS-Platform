import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QueryState } from '@/components/common/QueryState'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Skeleton,
} from '@/components/ui'
import { ACTION_REGISTRY } from '@/lib/automation'
import { formatDateTime } from '@/lib/format/date'
import type { AutomationActionType, AutomationRun } from '@/types'
import { useAutomationRun, useCancelRun, useRetryRun } from '../../hooks/use-automation-runs'
import { RunStatusBadge } from '../RunStatusBadge'

const entityLink = (run: AutomationRun) =>
  run.entity.kind === 'lead' ? `/leads/${run.entity.id}` : run.entity.kind === 'deal' ? `/deals/${run.entity.id}` : null

function Body({ run, canEdit }: { run: AutomationRun; canEdit: boolean }) {
  const retry = useRetryRun()
  const cancel = useCancelRun()
  const [confirming, setConfirming] = useState(false)
  const link = entityLink(run)
  const payload = Object.entries(run.triggerPayload).filter(([, value]) => value !== undefined && value !== null)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <RunStatusBadge status={run.status} />
        <Link className="text-sm font-medium hover:underline" to={`/automations/${run.automationId}`}>
          {run.automationName} (v{run.automationVersion})
        </Link>
      </div>

      <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Record</dt>
        <dd>{link ? <Link className="hover:underline" to={link}>{run.entity.kind} {run.entity.id}</Link> : `${run.entity.kind} ${run.entity.id}`}</dd>
        <dt className="text-muted-foreground">Trigger</dt>
        <dd>{run.triggerType.replaceAll('_', ' ')}</dd>
        <dt className="text-muted-foreground">Started</dt>
        <dd>{formatDateTime(run.startedAt)}</dd>
        {run.finishedAt ? (
          <>
            <dt className="text-muted-foreground">Finished</dt>
            <dd>{formatDateTime(run.finishedAt)}</dd>
          </>
        ) : null}
        {run.status === 'waiting' && run.resumeAt ? (
          <>
            <dt className="text-muted-foreground">Resumes</dt>
            <dd className="font-medium">{formatDateTime(run.resumeAt)}</dd>
          </>
        ) : null}
        <dt className="text-muted-foreground">Chain</dt>
        <dd>Depth {run.chain.depth}{run.chain.causedBy.length ? ` (caused by ${run.chain.causedBy.length} earlier automation${run.chain.causedBy.length === 1 ? '' : 's'})` : ''}</dd>
      </dl>

      {run.error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <span className="font-medium">Error: </span>
          {run.error}
        </p>
      ) : null}

      <section aria-label="Trigger payload" className="space-y-1">
        <h3 className="text-sm font-semibold">Trigger payload</h3>
        {payload.length === 0 ? (
          <p className="text-sm text-muted-foreground">The trigger carried no extra details.</p>
        ) : (
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(Object.fromEntries(payload), null, 2)}</pre>
        )}
      </section>

      {run.conditionTrace.length > 0 ? (
        <section aria-label="Conditions" className="space-y-1">
          <h3 className="text-sm font-semibold">Conditions</h3>
          <ul className="space-y-1 text-sm">
            {run.conditionTrace.map((item) => (
              <li key={item.label}>
                <span className="font-medium">{item.matched ? 'Matched' : 'Failed'}:</span> {item.label}
                <span className="block text-muted-foreground">{item.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Steps" className="space-y-2">
        <h3 className="text-sm font-semibold">Steps</h3>
        {run.steps.length === 0 ? <p className="text-sm text-muted-foreground">No steps ran.</p> : null}
        <ol className="space-y-2">
          {run.steps.map((step) => (
            <li key={step.path} className="rounded-md border border-border p-3 text-sm">
              <p className="font-medium">
                {ACTION_REGISTRY[step.actionType as AutomationActionType]?.label ?? step.actionType}{' '}
                <span className="font-normal text-muted-foreground">· {step.status}</span>
              </p>
              <p className="text-muted-foreground">{step.error ?? step.result}</p>
              {step.startedAt ? (
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(step.startedAt)}
                  {step.finishedAt && step.finishedAt !== step.startedAt ? ` to ${formatDateTime(step.finishedAt)}` : ''}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {canEdit && run.status === 'failed' ? (
        <Button loading={retry.isPending} onClick={() => retry.mutate(run.id)}>
          Retry from the failed step
        </Button>
      ) : null}
      {canEdit && run.status === 'waiting' ? (
        <>
          <Button variant="outline" onClick={() => setConfirming(true)}>
            Cancel this run
          </Button>
          <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            title="Cancel this waiting run?"
            description="The steps after the wait will not run for this record."
            confirmLabel="Cancel run"
            destructive
            loading={cancel.isPending}
            onConfirm={() => cancel.mutate(run.id, { onSuccess: () => setConfirming(false) })}
          />
        </>
      ) : null}
    </div>
  )
}

/** Run detail: payload, each step with result and timing, errors with Retry, waiting runs with Cancel. */
export function RunDrawer({ runId, onClose, canEdit }: { runId: string | null; onClose: () => void; canEdit: boolean }) {
  const run = useAutomationRun(runId)
  return (
    <Drawer open={runId !== null} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>Run details</DrawerTitle>
          <DrawerDescription>What the automation saw and did, step by step.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <QueryState isLoading={run.isLoading} isError={run.isError} onRetry={() => void run.refetch()} loading={<Skeleton className="h-40 w-full" />}>
            {run.data ? <Body run={run.data} canEdit={canEdit} /> : null}
          </QueryState>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
