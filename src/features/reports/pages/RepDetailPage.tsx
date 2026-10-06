import { useParams } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DateRangePicker, EmptyState } from '@/components/ui'
import { useDateRangeState } from '@/hooks/use-date-range-state'
import { usePermission } from '@/hooks/use-permission'
import { ApiError } from '@/services/api/errors'
import { RepCharts } from '../components/performance/RepCharts'
import { RepKpiCards } from '../components/performance/RepKpiCards'
import { TargetsPanel } from '../components/performance/TargetsPanel'
import { useRepDetail } from '../hooks/use-performance'

export function RepDetailPage() {
  const { userId } = useParams()
  const state = useDateRangeState()
  const { getScope } = usePermission()
  const detail = useRepDetail(userId, { range: state.range })
  const forbidden = detail.error instanceof ApiError && (detail.error.code === 'FORBIDDEN' || detail.error.code === 'NOT_FOUND')
  const backTo = getScope('reports') === 'own' ? [] : [{ label: 'Performance', to: '/reports/performance' }]
  const month = new Date().toISOString().slice(0, 7)

  if (forbidden) {
    return <EmptyState icon={ShieldOff} title="You can't view this rep" description="You can only open reps inside your data scope." />
  }
  const data = detail.data
  return (
    <div className="space-y-5">
      <PageHeader
        className="mb-0"
        title={data ? (data.isSelf ? `${data.name} (you)` : data.name) : 'Rep performance'}
        breadcrumbs={[{ label: 'Reports', to: '/reports' }, ...backTo, { label: data?.name ?? 'Rep' }]}
        description={data?.isSelf && getScope('reports') === 'own' ? 'Your numbers, compared with the team average.' : 'Compared with the team average.'}
      />
      <div className="print:hidden">
        <DateRangePicker
          preset={state.preset}
          fromDay={state.fromDay}
          toDay={state.toDay}
          compare={state.compare}
          onPreset={state.setPreset}
          onCustom={state.setCustom}
          onCompare={state.setCompare}
        />
      </div>
      <RepKpiCards
        kpis={data?.kpis}
        teamAverage={data?.teamAverage}
        isLoading={detail.isLoading}
        isError={detail.isError}
        onRetry={() => void detail.refetch()}
      />
      <TargetsPanel month={month} />
      <RepCharts detail={data} isLoading={detail.isLoading} isError={detail.isError} onRetry={() => void detail.refetch()} />
    </div>
  )
}
