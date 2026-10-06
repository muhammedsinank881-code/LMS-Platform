import { platformLabel } from '@/lib/campaign-labels'
import { formatINR } from '@/lib/format'
import { RESPONSE_BUCKET_LABELS } from '@/lib/metrics'
import { RESPONSE_BUCKETS, type ReportExportRequest, type ReportExportResult } from '@/types'
import type { RequestContext } from '../../core/context'
import { buildForecast, buildFunnelVelocity, buildResponseFollowUp, buildSourceRoi } from './advanced'
import { buildAttribution, buildCampaignReport } from './campaigns'
import type { ReportScope } from './scope'

const money = (value: number | null) => (value === null ? '' : formatINR(value))
const num = (value: number | null, digits = 1) => (value === null ? '' : value.toFixed(digits))

export const ADVANCED_TABS: readonly string[] = ['campaigns', 'source_roi', 'funnel', 'response', 'forecast']

function campaignsExport(ctx: RequestContext, data: ReportScope, request: ReportExportRequest): ReportExportResult {
  const mode = request.attribution ?? 'last'
  const report = buildCampaignReport(ctx, data)
  const credited = new Map(buildAttribution(ctx, data, mode).map((row) => [row.label, row.leads]))
  return {
    filename: 'campaign-performance.csv',
    headers: [
      'Campaign',
      'Platform',
      'Spend',
      'Leads',
      'Qualified',
      'Won',
      'Revenue',
      'CPL',
      'CAC',
      'ROAS',
      'Cost per qualified',
      `Channel leads (${mode}-touch)`,
    ],
    rows: report.campaigns.map((row) => [
      row.name,
      platformLabel(row.platform),
      money(row.spend),
      String(row.leads),
      String(row.qualified),
      String(row.won),
      money(row.revenue),
      money(row.cpl),
      money(row.cac),
      num(row.roas, 2),
      money(row.costPerQualified),
      String(credited.get(platformLabel(row.platform)) ?? ''),
    ]),
  }
}

export function buildAdvancedExport(
  ctx: RequestContext,
  data: ReportScope,
  request: ReportExportRequest,
): ReportExportResult {
  switch (request.tab) {
    case 'campaigns':
      return campaignsExport(ctx, data, request)
    case 'source_roi':
      return {
        filename: 'source-roi.csv',
        headers: ['Source', 'Leads', 'Qualified', 'Won', 'Qualified %', 'Win %', 'Lead to won %', 'Avg deal value', 'Avg days to close'],
        rows: buildSourceRoi(data).map((r) => [
          r.label,
          String(r.leads),
          String(r.qualified),
          String(r.won),
          num(r.qualifiedRate),
          num(r.winRate),
          num(r.leadToWonRate),
          money(r.avgDealValue),
          num(r.avgDaysToClose),
        ]),
      }
    case 'funnel':
      return {
        filename: 'funnel-velocity.csv',
        headers: ['Stage', 'Deals', 'Conversion from previous %', 'Avg days in stage'],
        rows: buildFunnelVelocity(data, request.stuckDays ?? 14, ctx.now).stages.map((s) => [
          s.name,
          String(s.count),
          num(s.conversionFromPrevious),
          num(s.avgDaysInStage),
        ]),
      }
    case 'response':
      return {
        filename: 'response-times.csv',
        headers: ['Source', ...RESPONSE_BUCKETS.map((b) => RESPONSE_BUCKET_LABELS[b]), 'Total'],
        rows: buildResponseFollowUp(data, ctx.now).bySource.map((r) => [
          r.label,
          ...RESPONSE_BUCKETS.map((b) => String(r.distribution[b])),
          String(r.total),
        ]),
      }
    default:
      return {
        filename: 'forecast.csv',
        headers: ['Month', 'Deals', 'Weighted', 'Worst case', 'Commit', 'Best case'],
        rows: buildForecast(data, ctx.now).months.map((m) => [
          m.month,
          String(m.deals),
          money(m.weighted),
          money(m.worst),
          money(m.commit),
          money(m.best),
        ]),
      }
  }
}
