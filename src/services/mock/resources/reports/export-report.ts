import { formatINR } from '@/lib/format'
import type { BreakdownDimension, ReportExportRequest, ReportExportResult, SalesPerformanceRow } from '@/types'
import type { RequestContext } from '../../core/context'
import { recordAudit } from '../../core/records'
import { buildBreakdown, buildLost, buildWinLoss } from './breakdowns'
import { averageWonValue, buildFollowUpMetrics, buildSalesPerformance } from './performance'
import { buildPipeline, buildRevenueOverTime } from './series'
import { buildSummary } from './summary'
import { ADVANCED_TABS, buildAdvancedExport } from './export-advanced'
import type { ReportScope } from './scope'

function money(value: number): string {
  return formatINR(value)
}

function performanceRows(rows: SalesPerformanceRow[]): ReportExportResult {
  return {
    filename: 'sales-performance.csv',
    headers: [
      'Salesperson',
      'Leads assigned',
      'Leads contacted',
      'Follow-ups',
      'Qualified',
      'Proposals',
      'Won',
      'Lost',
      'Revenue',
      'Conversion %',
      'Avg response (min)',
    ],
    rows: rows.map((row) => [
      row.name,
      String(row.leadsAssigned),
      String(row.leadsContacted),
      String(row.followUpsDone),
      String(row.qualified),
      String(row.proposals),
      String(row.won),
      String(row.lost),
      money(row.revenue),
      row.conversionRate === null ? '' : row.conversionRate.toFixed(1),
      row.avgResponseTimeMins === null ? '' : row.avgResponseTimeMins.toFixed(0),
    ]),
  }
}

function leadsExport(data: ReportScope, dimension: BreakdownDimension): ReportExportResult {
  const report = buildBreakdown(data, dimension)
  return {
    filename: `leads-by-${dimension}.csv`,
    headers: ['Label', 'Count'],
    rows: report.rows.map((row) => [row.label, String(row.count)]),
  }
}

function salesExport(ctx: RequestContext, data: ReportScope): ReportExportResult {
  const summary = buildSummary(data, ctx.now.getTime())
  const pipeline = buildPipeline(data)
  const metrics = buildFollowUpMetrics(data, ctx.now)
  const revenue = buildRevenueOverTime(data).points.reduce((sum, point) => sum + point.revenue, 0)
  const rows: string[][] = [
    ['Revenue', money(revenue)],
    ['Win rate', buildWinLoss(data).winRate.value.toFixed(1)],
    ['Conversion %', summary.conversionRate.value.toFixed(1)],
    ['Average deal value', money(averageWonValue(data) ?? 0)],
    ['Pipeline value', money(pipeline.total)],
    ['Weighted pipeline', money(pipeline.weighted)],
    ['Avg response (min)', metrics.avgResponseTimeMins === null ? '' : metrics.avgResponseTimeMins.toFixed(0)],
  ]
  for (const stage of pipeline.byStage) {
    const name = data.stages.find((item) => item.id === stage.stageId)?.name ?? stage.stageId
    rows.push([name, String(stage.count), money(stage.total)])
  }
  return { filename: 'sales-report.csv', headers: ['Metric', 'Value', 'Amount'], rows }
}

function lostExport(data: ReportScope): ReportExportResult {
  const lost = buildLost(data)
  return {
    filename: 'lost-leads.csv',
    headers: ['Reason', 'Count', 'Percent'],
    rows: lost.reasons.map((row) => [row.label, String(row.count), row.percent.toFixed(1)]),
  }
}

export function buildExport(ctx: RequestContext, data: ReportScope, request: ReportExportRequest): ReportExportResult {
  ctx.require('reports', 'export')
  const advanced = ADVANCED_TABS.includes(request.tab)
  const result = advanced
    ? buildAdvancedExport(ctx, data, request)
    : request.tab === 'performance'
      ? performanceRows(buildSalesPerformance(ctx, data))
      : request.tab === 'sales'
        ? salesExport(ctx, data)
        : request.tab === 'lost'
          ? lostExport(data)
          : leadsExport(data, request.dimension ?? 'source')
  recordAudit(ctx, {
    action: 'exported',
    entity: request.tab === 'sales' ? 'deal' : request.tab === 'campaigns' ? 'campaign' : 'report',
    entityId: `report-${request.tab}`,
    entityLabel: `${request.tab} report`,
    newValue: { rows: result.rows.length },
  })
  return result
}
