import type { DataTableColumn } from '@/components/common/data-table'
import { CurrencyText } from '@/components/common/CurrencyText'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Avatar } from '@/components/ui'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DirectoryUser } from '@/services/api/team'
import type { Deal, PipelineWithStages } from '@/types'

function stageOf(pipelines: PipelineWithStages[], id: string) {
  return pipelines.flatMap((pipeline) => pipeline.stages).find((stage) => stage.id === id)
}

export function createDealColumns(
  pipelines: PipelineWithStages[],
  users: DirectoryUser[],
  leadName: (id: string) => string,
): DataTableColumn<Deal>[] {
  const user = (id: string) => users.find((item) => item.id === id)
  return [
    { accessorKey: 'title', header: 'Deal', cell: ({ row }) => row.original.title },
    { id: 'lead', header: 'Lead', cell: ({ row }) => leadName(row.original.leadId) },
    { accessorKey: 'value', header: 'Value', cell: ({ row }) => <CurrencyText amount={row.original.value} /> },
    {
      id: 'stage',
      header: 'Stage',
      cell: ({ row }) => {
        const stage = stageOf(pipelines, row.original.stageId)
        return stage ? <StatusBadge name={stage.name} color={stage.color} /> : row.original.stageId
      },
    },
    { accessorKey: 'probability', header: 'Probability', cell: ({ row }) => `${row.original.probability}%` },
    { accessorKey: 'expectedRevenue', header: 'Expected revenue', cell: ({ row }) => <CurrencyText amount={row.original.expectedRevenue} /> },
    {
      accessorKey: 'expectedCloseDate',
      header: 'Expected close',
      cell: ({ row }) => {
        const past = Date.parse(row.original.expectedCloseDate) < Date.now() && !row.original.closedAt
        return <span className={cn(past && 'text-destructive')}>{formatDate(row.original.expectedCloseDate)}</span>
      },
    },
    {
      id: 'owner',
      header: 'Owner',
      cell: ({ row }) => <Avatar name={user(row.original.ownerId)?.name ?? 'Owner'} size="xs" />,
    },
    {
      id: 'pipeline',
      header: 'Pipeline',
      cell: ({ row }) => pipelines.find((pipeline) => pipeline.id === row.original.pipelineId)?.name ?? '',
    },
    { accessorKey: 'product', header: 'Product' },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => stageOf(pipelines, row.original.stageId)?.type ?? 'open',
    },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatDate(row.original.createdAt) },
  ]
}
