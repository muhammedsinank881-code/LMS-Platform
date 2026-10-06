import { Link } from 'react-router-dom'
import type { DataTableColumn } from '@/components/common/data-table'
import { Sparkline } from '@/components/common/Sparkline'
import { sparklineLabel } from '@/lib/sparkline'
import { Checkbox } from '@/components/ui'
import type { CampaignWithMetrics } from '@/types'
import { CampaignStatusBadge, PlatformBadge } from '../CampaignBadges'
import { CountCell, MoneyCell, PercentCell, RoasCell } from '../MetricCells'
import { PerformanceFlag } from '../PerformanceFlag'

const stop = (event: { stopPropagation: () => void }) => event.stopPropagation()

const numeric = { align: 'right' as const, className: 'min-w-[5.5rem]' }

export function createCampaignColumns({
  spendHidden,
  tenantAvgCpl,
}: {
  spendHidden: boolean
  tenantAvgCpl: number | null
}): DataTableColumn<CampaignWithMetrics>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          size="sm"
          aria-label="Select all campaigns on this page"
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
          onClick={stop}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="sm"
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          onClick={stop}
        />
      ),
      enableSorting: false,
      meta: { align: 'center', className: 'w-10 min-w-10 max-w-10 px-2' },
    },
    {
      accessorKey: 'name',
      header: 'Campaign',
      meta: { className: 'min-w-[14rem]' },
      cell: ({ row }) => (
        <div className="min-w-0 space-y-1">
          <Link
            to={`/campaigns/${row.original.id}`}
            className="block truncate font-medium text-foreground hover:underline"
            onClick={stop}
          >
            {row.original.name}
          </Link>
          <PerformanceFlag metrics={row.original.metrics} tenantAvgCpl={tenantAvgCpl} />
        </div>
      ),
    },
    {
      id: 'platform',
      header: 'Platform',
      enableSorting: false,
      cell: ({ row }) => <PlatformBadge platform={row.original.platform} />,
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => <CampaignStatusBadge status={row.original.status} />,
    },
    {
      id: 'spend',
      header: 'Spend',
      meta: numeric,
      cell: ({ row }) => <MoneyCell value={row.original.metrics.spend} hidden={spendHidden} />,
    },
    {
      id: 'leads',
      header: 'Leads',
      meta: numeric,
      cell: ({ row }) => <CountCell value={row.original.metrics.leads} />,
    },
    {
      id: 'qualified',
      header: 'Qualified',
      enableSorting: false,
      meta: numeric,
      cell: ({ row }) => <CountCell value={row.original.metrics.qualified} />,
    },
    {
      id: 'deals',
      header: 'Deals',
      enableSorting: false,
      meta: numeric,
      cell: ({ row }) => <CountCell value={row.original.metrics.deals} />,
    },
    {
      id: 'revenue',
      header: 'Revenue',
      meta: numeric,
      cell: ({ row }) => <MoneyCell value={row.original.metrics.revenue} hidden={spendHidden} />,
    },
    {
      id: 'cpl',
      header: 'CPL',
      meta: numeric,
      cell: ({ row }) => <MoneyCell value={row.original.metrics.cpl} hidden={spendHidden} />,
    },
    {
      id: 'cac',
      header: 'CAC',
      enableSorting: false,
      meta: numeric,
      cell: ({ row }) => <MoneyCell value={row.original.metrics.cac} hidden={spendHidden} />,
    },
    {
      id: 'roas',
      header: 'ROAS',
      meta: numeric,
      cell: ({ row }) => <RoasCell value={row.original.metrics.roas} hidden={spendHidden} />,
    },
    {
      id: 'conversionRate',
      header: 'Conv. rate',
      enableSorting: false,
      meta: numeric,
      cell: ({ row }) => <PercentCell value={row.original.metrics.conversionRate} />,
    },
    {
      id: 'trend',
      header: 'Trend',
      enableSorting: false,
      cell: ({ row }) => (
        <Sparkline values={row.original.trend} label={sparklineLabel('Leads', row.original.trend)} />
      ),
    },
  ]
}
