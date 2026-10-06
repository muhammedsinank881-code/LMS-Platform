import { Download, Printer } from 'lucide-react'
import {
  Button,
  DateRangePicker,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  Select,
} from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { downloadCsv, serializeCsv } from '@/lib/csv'
import { downloadXlsx } from '@/lib/xlsx'
import { useCampaigns } from '@/features/campaigns/hooks/use-campaigns'
import { useSources } from '@/features/settings/hooks/use-lead-config'
import { useDirectory, useTeams } from '@/features/team/hooks/use-team'
import { useExportReport } from '../hooks/use-reports'
import { SavedReportsMenu } from './SavedReportsMenu'

function options(rows: Array<{ id: string; name: string }> | undefined, allLabel: string) {
  return [{ value: 'all', label: allLabel }, ...(rows ?? []).map((row) => ({ value: row.id, label: row.name }))]
}

export function ReportToolbar({ state, canExport }: { state: DateRangeState; canExport: boolean }) {
  const { getScope } = usePermission()
  const scope = getScope('reports')
  const sources = useSources()
  const campaigns = useCampaigns({ pageSize: 100 })
  const directory = useDirectory()
  const teams = useTeams()
  const exporter = useExportReport()

  const exportReport = async (format: 'csv' | 'xlsx') => {
    const result = await exporter.mutateAsync({
      ...state.query,
      tab: state.tab,
      dimension: state.dimension,
      attribution: state.attribution,
      stuckDays: state.stuckDays,
    })
    if (format === 'csv') downloadCsv(result.filename, serializeCsv(result.headers, result.rows))
    else await downloadXlsx(result.filename, result.headers, result.rows, state.tab)
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
      <DateRangePicker
        preset={state.preset}
        fromDay={state.fromDay}
        toDay={state.toDay}
        compare={state.compare}
        onPreset={state.setPreset}
        onCustom={state.setCustom}
        onCompare={state.setCompare}
      />
      <Select className="w-[calc(50%-0.25rem)] sm:w-40" aria-label="Source" value={state.sourceId ?? 'all'} onValueChange={(value) => state.setFilter('source', value === 'all' ? null : value)} options={options(sources.data, 'All sources')} />
      {scope !== 'own' ? (
        <Select className="w-[calc(50%-0.25rem)] sm:w-40" aria-label="Salesperson" value={state.userId ?? 'all'} onValueChange={(value) => state.setFilter('owner', value === 'all' ? null : value)} options={options(directory.data, 'All salespeople')} />
      ) : null}
      <Select className="w-[calc(50%-0.25rem)] sm:w-40" aria-label="Campaign" value={state.campaignId ?? 'all'} onValueChange={(value) => state.setFilter('campaign', value === 'all' ? null : value)} options={options(campaigns.data?.items, 'All campaigns')} />
      {scope === 'all' ? (
        <Select className="w-[calc(50%-0.25rem)] sm:w-40" aria-label="Team" value={state.teamId ?? 'all'} onValueChange={(value) => state.setFilter('team', value === 'all' ? null : value)} options={options(teams.data, 'All teams')} />
      ) : null}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <SavedReportsMenu tab={state.tab} />
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer aria-hidden="true" /> Print
        </Button>
        {canExport ? (
          <Dropdown>
            <DropdownTrigger asChild>
              <Button size="sm" variant="outline" loading={exporter.isPending}>
                <Download aria-hidden="true" /> Export
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownItem onSelect={() => void exportReport('csv')}>Download CSV</DropdownItem>
              <DropdownItem onSelect={() => void exportReport('xlsx')}>Download Excel (.xlsx)</DropdownItem>
            </DropdownContent>
          </Dropdown>
        ) : null}
      </div>
    </div>
  )
}
