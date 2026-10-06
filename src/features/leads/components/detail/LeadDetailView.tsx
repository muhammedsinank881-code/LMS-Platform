import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/components/ui'
import { useDeals } from '@/features/deals/hooks/use-deals'
import { useQualificationQuestions } from '@/features/settings/hooks/use-settings'
import { usePermission } from '@/hooks/use-permission'
import type { CustomFieldDefinition, DuplicateMatch, Lead } from '@/types'
import { useUiStore } from '@/store/ui-store'
import { useChangeLeadStatus } from '../../hooks/use-change-lead-status'
import { useLeadPermissions } from '../../hooks/use-lead-permissions'
import { LEAD_TABS, useLeadTab, type LeadTab } from '../../hooks/use-lead-tab'
import { useDuplicateCheck, useLead, useLeads } from '../../hooks/use-leads'
import { useLeadLookups } from '../../hooks/use-lead-lookups'
import { listParamsFromSearch, readLeadListSearch } from '../../lib/list-return'
import type { ComposerTab } from './ActivityComposer'
import { LeadDetailDialogs, type DetailPanel } from './LeadDetailDialogs'
import { LeadDetailHeader } from './LeadDetailHeader'
import { LeadDuplicateBanner } from './LeadDuplicateBanner'
import { LeadMobileBar } from './LeadMobileBar'
import { LeadQuickActions } from './LeadQuickActions'
import { LeadRail } from './rail/LeadRail'
import { AuditTab } from './tabs/AuditTab'
import { ConversationsTab } from './tabs/ConversationsTab'
import { DealTab } from './tabs/DealTab'
import { FollowUpsTab } from './tabs/FollowUpsTab'
import { OverviewTab } from './tabs/OverviewTab'
import { QualificationTab } from './tabs/QualificationTab'
import { TimelineTab } from './tabs/TimelineTab'

const TAB_LABEL: Record<LeadTab, string> = {
  overview: 'Overview',
  timeline: 'Timeline',
  'follow-ups': 'Follow-ups & Tasks',
  conversations: 'Conversations',
  deal: 'Deal',
  qualification: 'Qualification',
  audit: 'Audit',
}

export function LeadDetailView({ lead }: { lead: Lead }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useLeadTab()
  const [panel, setPanel] = useState<DetailPanel>(null)
  const [composerTab, setComposerTab] = useState<ComposerTab>('note')
  const [focusTick, setFocusTick] = useState(0)
  const { lookups, customFields, lostReasons } = useLeadLookups()
  const questions = useQualificationQuestions()
  const access = useLeadPermissions(lead)
  const { can } = usePermission()
  const openFollowUp = useUiStore((state) => state.openFollowUp)
  const change = useChangeLeadStatus()
  const listSearch = readLeadListSearch(location.state)
  const neighbors = useLeads(useMemo(() => listParamsFromSearch(listSearch), [listSearch]))
  const deals = useDeals({
    filters: [{ field: 'leadId', operator: 'equals', value: lead.id }],
    pageSize: 1,
  })
  const duplicates = useDuplicateCheck(
    { phone: lead.phone, whatsapp: lead.whatsapp, email: lead.email, company: lead.company },
    { excludeId: lead.id },
  )
  const linked = useLead(lead.duplicateOf)
  const items = neighbors.data?.items ?? []
  const index = items.findIndex((item) => item.id === lead.id)
  const prevId = index > 0 ? items[index - 1].id : null
  const nextId = index >= 0 && index < items.length - 1 ? items[index + 1].id : null
  const matches = withLinked(duplicates.data ?? [], linked.data)
  const currentStatus = lookups.statuses.find((status) => status.id === lead.statusId)
  const canConvertDeal =
    can('deals', 'create') &&
    access.canEdit &&
    lead.qualificationStatus === 'qualified' &&
    !lead.convertedToCustomerId &&
    deals.data?.total === 0

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft' && prevId) {
        event.preventDefault()
        navigate(`/leads/${prevId}`, { state: { listSearch } })
      }
      if (event.key === 'ArrowRight' && nextId) {
        event.preventDefault()
        navigate(`/leads/${nextId}`, { state: { listSearch } })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, nextId, prevId, listSearch])

  const openComposer = (next: ComposerTab) => {
    setTab('timeline')
    setComposerTab(next)
    setFocusTick((value) => value + 1)
  }

  const onStatus = (statusId: string) => {
    const status = lookups.statuses.find((item) => item.id === statusId)
    if (!status || status.id === lead.statusId || !access.canEdit) return
    if (status.type === 'lost') setPanel({ type: 'lost', statusId })
    else if (status.type === 'invalid') setPanel({ type: 'invalid', statusId })
    else if (status.type === 'won') {
      if (!access.canConvert) return
      setPanel({ type: 'customer', statusId })
    } else change.mutate({ id: lead.id, statusId })
  }

  const go = (id: string) => navigate(`/leads/${id}`, { state: { listSearch } })

  return (
    <div className="space-y-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <LeadDetailHeader
        lead={lead}
        lookups={lookups}
        backTo={listSearch}
        lostReasonName={lostReasons.find((reason) => reason.id === lead.lostReasonId)?.name}
        canEdit={access.canEdit}
        canAssign={access.canAssign}
        prevId={prevId}
        nextId={nextId}
        onStatus={onStatus}
        onAssign={() => access.canAssign && setPanel({ type: 'assign' })}
        onNavigate={go}
      />
      <LeadDuplicateBanner matches={matches} onCompare={(leadId) => setPanel({ type: 'compare', leadId })} />
      <LeadQuickActions
        lead={lead}
        canEdit={access.canEdit}
        canAssign={access.canAssign}
        canDelete={access.canDelete}
        canConvertDeal={canConvertDeal}
        showReopen={currentStatus?.type === 'lost'}
        onCompose={openComposer}
        onFollowUp={() =>
          openFollowUp({
            leadIds: [lead.id],
            lockLead: true,
            assigneeId: lead.assignedTo ?? undefined,
          })
        }
        onConvertDeal={() => setPanel({ type: 'deal' })}
        onEdit={() => setPanel({ type: 'edit' })}
        onAssign={() => setPanel({ type: 'assign' })}
        onDelete={() => setPanel({ type: 'delete' })}
        onMerge={() => openMerge(matches, (leadId) => setPanel({ type: 'compare', leadId }))}
        onReopen={() => setPanel({ type: 'reopen' })}
      />
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="order-2 min-w-0 lg:order-1">
          <Tabs value={tab} onValueChange={(value) => isTab(value) && setTab(value)}>
            <TabsList aria-label="Lead sections">
              {LEAD_TABS.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {TAB_LABEL[item]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview" className="mt-3">
              <OverviewTab lead={lead} lookups={lookups} fields={leadFields(customFields)} questions={questions.data ?? []} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-3">
              <TimelineTab
                lead={lead}
                lookups={lookups}
                canEdit={access.canEdit}
                userId={access.userId}
                composerTab={composerTab}
                onComposerTab={setComposerTab}
                focusTick={focusTick}
              />
            </TabsContent>
            <TabsContent value="follow-ups" className="mt-3">
              <FollowUpsTab lead={lead} lookups={lookups} />
            </TabsContent>
            <TabsContent value="conversations" className="mt-3">
              <ConversationsTab lead={lead} />
            </TabsContent>
            <TabsContent value="deal" className="mt-3">
              <DealTab lead={lead} canConvert={canConvertDeal} onConvert={() => setPanel({ type: 'deal' })} />
            </TabsContent>
            <TabsContent value="qualification" className="mt-3">
              <QualificationTab lead={lead} questions={questions.data ?? []} canEdit={access.canEdit} />
            </TabsContent>
            <TabsContent value="audit" className="mt-3">
              <AuditTab lead={lead} />
            </TabsContent>
          </Tabs>
        </div>
        <aside className="order-1 lg:order-2">
          <LeadRail lead={lead} lookups={lookups} canEdit={access.canEdit} />
        </aside>
      </div>
      <LeadMobileBar lead={lead} lookups={lookups} canEdit={access.canEdit} onNote={() => openComposer('note')} onStatus={onStatus} />
      <LeadDetailDialogs
        lead={lead}
        panel={panel}
        lookups={lookups}
        customFields={leadFields(customFields)}
        lostReasons={lostReasons}
        backTo={listSearch}
        onPanel={setPanel}
      />
    </div>
  )
}

function isTab(value: string): value is LeadTab {
  return (LEAD_TABS as readonly string[]).includes(value)
}

function leadFields(fields: CustomFieldDefinition[]) {
  return fields.filter((field) => field.entity === 'lead')
}

function withLinked(matches: DuplicateMatch[], linked: Lead | undefined): DuplicateMatch[] {
  if (!linked || matches.some((match) => match.lead.id === linked.id)) return matches
  return [
    ...matches,
    {
      lead: {
        id: linked.id,
        name: linked.name,
        phone: linked.phone,
        email: linked.email,
        company: linked.company,
        statusId: linked.statusId,
        assignedTo: linked.assignedTo,
        createdAt: linked.createdAt,
      },
      confidence: 'high',
      matchedOn: [],
    },
  ]
}

function openMerge(matches: DuplicateMatch[], compare: (leadId: string) => void) {
  const first = matches[0]
  if (!first) {
    toast.info('No duplicate to merge')
    return
  }
  compare(first.lead.id)
}
