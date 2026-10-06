import { useMemo, useState } from 'react'
import { FileText, Plus, SearchX } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { NoAccess } from '@/components/common/NoAccess'
import { SearchInput } from '@/components/common/SearchInput'
import { queryBlocked } from '@/components/common/query-blocked'
import { Button, EmptyState, Select, Tabs, TabsList, TabsTrigger, toast } from '@/components/ui'
import {
  useCloneTemplate,
  useDeleteTemplate,
  useSubmitTemplate,
  useTemplates,
} from '@/features/inbox/hooks/use-templates'
import { usePermission } from '@/hooks/use-permission'
import { TEMPLATE_CATEGORIES, TEMPLATE_STATUSES, type MessageTemplate, type TemplateChannel } from '@/types'
import { SectionIntro } from '../components/SettingsLayout'
import { QuickRepliesPanel } from '../components/templates/QuickRepliesPanel'
import { TemplateCard } from '../components/templates/TemplateCard'
import { TemplateEditorDrawer } from '../components/templates/TemplateEditorDrawer'
import { TEMPLATE_STATUS_LABEL } from '../components/templates/status-meta'
import { LANGUAGES } from '../lib/template-form'

const ANY = 'any'

export function TemplatesSettingsPage() {
  const { canSection } = usePermission()
  const templates = useTemplates()
  const submit = useSubmitTemplate()
  const clone = useCloneTemplate()
  const remove = useDeleteTemplate()
  const [channel, setChannel] = useState<TemplateChannel | 'all'>('all')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(ANY)
  const [category, setCategory] = useState(ANY)
  const [language, setLanguage] = useState(ANY)
  const [editing, setEditing] = useState<MessageTemplate | null | 'new'>(null)
  const [deleting, setDeleting] = useState<MessageTemplate | null>(null)
  const all = templates.data ?? []

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return all.filter(
      (item) =>
        (channel === 'all' || item.channel === channel) &&
        (status === ANY || item.status === status) &&
        (category === ANY || item.category === category) &&
        (language === ANY || item.language === language) &&
        (!term || `${item.name} ${item.subject ?? ''} ${item.body}`.toLowerCase().includes(term)),
    )
  }, [all, category, channel, language, search, status])

  if (!canSection('templates')) return <NoAccess />
  const blocked = queryBlocked(templates)
  if (blocked) return blocked
  const filtered = channel !== 'all' || status !== ANY || category !== ANY || language !== ANY || search !== ''
  const count = (value: TemplateChannel) => all.filter((item) => item.channel === value).length

  return (
    <div className="space-y-6">
      <SectionIntro title="Message templates" description="Reusable WhatsApp and email messages, plus quick replies for the inbox." />
      <div className="flex flex-wrap items-center gap-3">
        <Tabs variant="pill" value={channel} onValueChange={(value) => setChannel(value as typeof channel)}>
          <TabsList aria-label="Channel">
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp ({count('whatsapp')})</TabsTrigger>
            <TabsTrigger value="email">Email ({count('email')})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex-1" />
        <Button type="button" onClick={() => setEditing('new')}>
          <Plus /> New template
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchInput onValueChange={setSearch} placeholder="Search templates" aria-label="Search templates" />
        <Select aria-label="Status" value={status} onValueChange={setStatus} options={[{ value: ANY, label: 'Any status' }, ...TEMPLATE_STATUSES.map((item) => ({ value: item, label: TEMPLATE_STATUS_LABEL[item] }))]} />
        <Select aria-label="Category" value={category} onValueChange={setCategory} options={[{ value: ANY, label: 'Any category' }, ...TEMPLATE_CATEGORIES.map((item) => ({ value: item, label: item[0].toUpperCase() + item.slice(1) }))]} />
        <Select aria-label="Language" value={language} onValueChange={setLanguage} options={[{ value: ANY, label: 'Any language' }, ...LANGUAGES.map((item) => ({ value: item.value, label: item.label }))]} />
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon={filtered ? SearchX : FileText}
          title={filtered ? 'No templates match' : 'No templates yet'}
          description={filtered ? 'Clear a filter or search for something else.' : 'Create a draft, then submit WhatsApp templates for approval.'}
          action={filtered ? undefined : <Button onClick={() => setEditing('new')}>New template</Button>}
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2" aria-label="Templates">
          {rows.map((item) => (
            <TemplateCard
              key={item.id}
              template={item}
              busy={submit.isPending || clone.isPending}
              onEdit={() => setEditing(item)}
              onClone={() => clone.mutate(item.id, { onSuccess: () => toast.success('Cloned as a draft') })}
              onSubmit={() => submit.mutate(item.id, { onSuccess: () => toast.success('Submitted for approval') })}
              onDelete={() => setDeleting(item)}
            />
          ))}
        </ul>
      )}
      <QuickRepliesPanel />
      <TemplateEditorDrawer
        open={editing !== null}
        template={editing === 'new' ? null : editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.name ?? ''}"?`}
        description="Messages already sent from it stay in the inbox. This cannot be undone."
        confirmLabel="Delete template"
        destructive
        loading={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id, { onSuccess: () => { setDeleting(null); toast.success('Template deleted') } })
        }}
      />
    </div>
  )
}
