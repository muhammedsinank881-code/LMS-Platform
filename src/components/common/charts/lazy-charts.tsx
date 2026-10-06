import { lazy, Suspense, type ComponentProps } from 'react'
import { ChartCard } from './ChartCard'
import type { AreaChartCard as AreaChartImpl } from './AreaChartCard'
import type { BarChartCard as BarChartImpl } from './BarChartCard'
import type { DonutChartCard as DonutChartImpl } from './DonutChartCard'
import type { DualAxisChartCard as DualAxisImpl } from './DualAxisChartCard'

interface ChartFrame {
  title: string
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

function ChartFallback(props: ChartFrame) {
  return (
    <ChartCard
      title={props.title}
      isLoading={props.isLoading}
      isError={props.isError}
      onRetry={props.onRetry}
      summary={{ caption: props.title, columns: [], rows: [] }}
    >
      {null}
    </ChartCard>
  )
}

const LazyArea = lazy(() => import('./AreaChartCard').then((mod) => ({ default: mod.AreaChartCard })))
const LazyBar = lazy(() => import('./BarChartCard').then((mod) => ({ default: mod.BarChartCard })))
const LazyDonut = lazy(() => import('./DonutChartCard').then((mod) => ({ default: mod.DonutChartCard })))

export function AreaChartCard(props: ComponentProps<typeof AreaChartImpl>) {
  if (props.isLoading || props.isError) return <ChartFallback {...props} />
  return (
    <Suspense fallback={<ChartFallback title={props.title} isLoading />}>
      <LazyArea {...props} />
    </Suspense>
  )
}

export function BarChartCard(props: ComponentProps<typeof BarChartImpl>) {
  if (props.isLoading || props.isError) return <ChartFallback {...props} />
  return (
    <Suspense fallback={<ChartFallback title={props.title} isLoading />}>
      <LazyBar {...props} />
    </Suspense>
  )
}

export function DonutChartCard(props: ComponentProps<typeof DonutChartImpl>) {
  if (props.isLoading || props.isError) return <ChartFallback {...props} />
  return (
    <Suspense fallback={<ChartFallback title={props.title} isLoading />}>
      <LazyDonut {...props} />
    </Suspense>
  )
}

const LazyDual = lazy(() => import('./DualAxisChartCard').then((mod) => ({ default: mod.DualAxisChartCard })))

export function DualAxisChartCard(props: ComponentProps<typeof DualAxisImpl>) {
  if (props.isLoading || props.isError) return <ChartFallback {...props} />
  return (
    <Suspense fallback={<ChartFallback title={props.title} isLoading />}>
      <LazyDual {...props} />
    </Suspense>
  )
}
