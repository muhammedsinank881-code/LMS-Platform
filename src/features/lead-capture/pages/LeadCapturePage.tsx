import { useState } from 'react'
import { FileInput, Plus } from 'lucide-react'
import { NoAccess } from '@/components/common/NoAccess'
import { QueryState } from '@/components/common/QueryState'
import { Button } from '@/components/ui'
import { SectionIntro } from '@/features/settings/components/SettingsLayout'
import { usePermission } from '@/hooks/use-permission'
import type { LeadForm } from '@/types'
import { FormBuilder } from '../components/FormBuilder'
import { FormList } from '../components/FormList'
import { useLeadForms } from '../hooks/use-lead-forms'

export function LeadCapturePage() {
  const { canSection } = usePermission()
  const forms = useLeadForms()
  const [editing, setEditing] = useState<LeadForm | 'new' | null>(null)
  if (!canSection('lead_capture')) return <NoAccess />

  if (editing) {
    return <FormBuilder key={editing === 'new' ? 'new' : editing.id} form={editing === 'new' ? null : editing} onBack={() => setEditing(null)} />
  }
  return (
    <div className="space-y-4">
      <SectionIntro
        title="Lead capture"
        description="Build forms that turn visitors into leads, then publish them as a link or an embed."
        actions={<Button onClick={() => setEditing('new')}><Plus aria-hidden="true" /> New form</Button>}
      />
      <QueryState
        isLoading={forms.isLoading}
        isError={forms.isError}
        onRetry={() => void forms.refetch()}
        isEmpty={forms.data?.length === 0}
        emptyIcon={FileInput}
        emptyTitle="No forms yet"
        emptyDescription="Create a form to start collecting leads from your website or campaigns."
        emptyAction={<Button onClick={() => setEditing('new')}>Create a form</Button>}
      >
        <FormList forms={forms.data ?? []} onEdit={setEditing} />
      </QueryState>
    </div>
  )
}
