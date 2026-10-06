import { useMemo, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { NoAccess } from '@/components/common/NoAccess'
import { QueryState } from '@/components/common/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Card, CardContent, toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { templateContent, validateAutomation } from '@/lib/automation'
import { useDirectory } from '@/features/team/hooks/use-team'
import type { Automation, AutomationContent } from '@/types'
import { BuilderSaveBar } from '../components/builder/BuilderSaveBar'
import { IfCard, ThenHeader, WhenCard } from '../components/builder/FlowCards'
import { SummaryPanel } from '../components/builder/SummaryPanel'
import { TestPanel } from '../components/builder/TestPanel'
import { ThenList } from '../components/builder/ThenList'
import { VersionHistory } from '../components/builder/VersionHistory'
import { TextInput } from '../components/forms/controls'
import { useAutomationRefs } from '../hooks/use-automation-refs'
import {
  useAutomation,
  useAutomationTemplates,
  useCreateAutomation,
  usePublishAutomation,
  useUpdateAutomation,
} from '../hooks/use-automations'
import { blankDraft, fromContent, toContent } from '../lib/builder-draft'
import { firstByPath, issuesByPath } from '../lib/issues'

const contentOf = (a: Automation): AutomationContent => ({
  name: a.name,
  description: a.description,
  trigger: a.trigger,
  conditions: a.conditions,
  actions: a.actions,
})

/** /automations/new and /automations/:id. Loads the automation (or a template), then hands over to the form. */
export function AutomationBuilderPage() {
  const { id } = useParams()
  const [search] = useSearchParams()
  const { can } = usePermission()
  const automation = useAutomation(id)
  const templates = useAutomationTemplates()
  const templateKey = search.get('template')

  if (!can('automations', 'view')) return <NoAccess title="You don't have access to automations" />

  const template = templateKey ? templates.data?.find((t) => t.key === templateKey) : undefined
  const waiting = id ? automation.isLoading : Boolean(templateKey) && templates.isLoading
  const failed = id ? automation.isError : false

  return (
    <QueryState isLoading={waiting} isError={failed} onRetry={() => void automation.refetch()}>
      <BuilderForm
        key={id ? `${id}-${automation.data?.updatedAt ?? ''}` : `new-${templateKey ?? 'blank'}`}
        automation={automation.data}
        initial={automation.data ? contentOf(automation.data) : template ? templateContent(template) : toContent(blankDraft())}
      />
    </QueryState>
  )
}

function BuilderForm({ automation, initial }: { automation?: Automation; initial: AutomationContent }) {
  const navigate = useNavigate()
  const { can } = usePermission()
  const refs = useAutomationRefs()
  const directory = useDirectory()
  const create = useCreateAutomation()
  const update = useUpdateAutomation()
  const publish = usePublishAutomation()
  const [draft, setDraft] = useState(() => fromContent(initial))
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial))
  const leaving = useRef(false)

  const isNew = !automation
  const canEdit = can('automations', isNew ? 'create' : 'edit')
  const content = useMemo(() => toContent(draft), [draft])
  const dirty = JSON.stringify(content) !== baseline
  const issues = useMemo(() => (refs.ready ? validateAutomation(content, refs.refs) : []), [content, refs.ready, refs.refs])
  const byPath = useMemo(() => issuesByPath(issues), [issues])
  const errorCount = issues.filter((i) => i.severity === 'error').length

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname)

  const goTo = (saved: Automation) => {
    leaving.current = true
    navigate(`/automations/${saved.id}`, { replace: true })
  }
  const saveDraft = async () => {
    if (isNew) {
      const saved = await create.mutateAsync(content)
      toast.success('Draft saved')
      goTo(saved)
      return
    }
    await update.mutateAsync({ id: automation.id, patch: content })
    setBaseline(JSON.stringify(content))
    toast.success('Draft saved')
  }
  const publishNow = async () => {
    const target = isNew ? await create.mutateAsync(content) : automation
    const saved = await publish.mutateAsync({ id: target.id, input: content })
    setBaseline(JSON.stringify(content))
    toast.success(`Published version ${saved.version}`)
    if (isNew) goTo(saved)
  }
  const userName = (userId: string | null) => directory.data?.find((u) => u.id === userId)?.name ?? 'Unknown'

  return (
    <div>
      <PageHeader
        title={draft.name.trim() || 'New automation'}
        description="When something happens, if it matches, do these steps."
        breadcrumbs={[{ label: 'Automations', to: '/automations' }, { label: draft.name.trim() || 'New automation' }]}
        actions={
          automation ? (
            <>
              <Badge tone={automation.status === 'published' ? 'primary' : 'neutral'} dot>
                {automation.status === 'published' ? `Published v${automation.version}` : 'Draft'}
              </Badge>
              <Badge tone={automation.enabled ? 'success' : 'neutral'} dot>
                {automation.enabled ? 'On' : 'Off'}
              </Badge>
            </>
          ) : (
            <Badge tone="neutral">Not saved</Badge>
          )
        }
      />
      {!canEdit ? (
        <p role="status" className="mb-4 rounded-md border border-border bg-muted p-3 text-sm">
          You can view this automation but not change it. Ask an admin for access.
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <TextInput label="Name" value={draft.name} error={byPath.name?.[0]} placeholder="e.g. Welcome new Facebook leads" onChange={(name) => setDraft({ ...draft, name })} />
              <TextInput label="Description" value={draft.description} onChange={(description) => setDraft({ ...draft, description })} />
            </CardContent>
          </Card>
          <WhenCard trigger={draft.trigger} options={refs.options} issues={byPath.trigger ?? []} disabled={!canEdit} onChange={(trigger) => setDraft({ ...draft, trigger })} />
          <IfCard conditions={draft.conditions} fieldConfigs={refs.fieldConfigs} issues={firstByPath(byPath, 'conditions')} disabled={!canEdit} onChange={(conditions) => setDraft({ ...draft, conditions })} />
          <section className="space-y-3" aria-label="Steps">
            <ThenHeader />
            {byPath.actions ? (
              <p role="alert" className="text-sm text-destructive">
                {byPath.actions[0]}
              </p>
            ) : null}
            <ThenList
              items={draft.actions}
              options={refs.options}
              lookups={refs.lookups}
              fieldConfigs={refs.fieldConfigs}
              issues={byPath}
              allowed={refs.refs.allowedActions}
              disabled={!canEdit}
              onChange={(actions) => setDraft({ ...draft, actions })}
            />
          </section>
        </div>
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:self-start">
          <SummaryPanel content={content} lookups={refs.lookups} issues={issues} />
          <TestPanel content={content} disabled={!canEdit} />
          {automation ? (
            <VersionHistory
              automationId={automation.id}
              currentVersion={automation.status === 'published' ? automation.version : -1}
              canRestore={canEdit}
              userName={userName}
            />
          ) : null}
        </aside>
      </div>
      {canEdit ? (
        <BuilderSaveBar
          dirty={dirty}
          isNew={isNew}
          isPublished={automation?.status === 'published'}
          errorCount={errorCount}
          saving={create.isPending || update.isPending}
          publishing={publish.isPending}
          onSaveDraft={() => void saveDraft()}
          onPublish={() => void publishNow()}
          onDiscard={() => {
            setDraft(fromContent(initial))
            setBaseline(JSON.stringify(initial))
          }}
        />
      ) : null}
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={() => blocker.reset?.()}
        title="Leave without saving?"
        description="Your changes to this automation will be lost."
        confirmLabel="Leave"
        destructive
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  )
}
