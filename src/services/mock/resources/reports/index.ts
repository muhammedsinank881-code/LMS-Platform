import type { ReportsApiClient } from '@/services/api/reports'
import { request } from '../../core/context'
import { buildForecast, buildFunnelVelocity, buildResponseFollowUp, buildSourceRoi } from './advanced'
import { buildBreakdown, buildLost, buildWinLoss } from './breakdowns'
import { buildAttribution, buildCampaignReport, buildSpendVsRevenue } from './campaigns'
import { buildExport } from './export-report'
import { buildCallList, buildRecentActivity } from './lists'
import { buildFollowUpMetrics, buildSalesPerformance } from './performance'
import { createSavedReport, deleteSavedReport, listSavedReports } from './saved'
import { openReport } from './scope'
import { buildFunnel, buildLeadsOverTime, buildPipeline, buildRevenueOverTime } from './series'
import { buildSummary } from './summary'

export const mockReportsApi: ReportsApiClient = {
  summary: (query) => request((ctx) => buildSummary(openReport(ctx, 'dashboard', query), ctx.now.getTime())),
  leadsOverTime: (query) => request((ctx) => buildLeadsOverTime(openReport(ctx, 'reports', query))),
  breakdown: (query, dimension) => request((ctx) => buildBreakdown(openReport(ctx, 'reports', query), dimension)),
  funnel: (query) => request((ctx) => buildFunnel(openReport(ctx, 'reports', query))),
  revenueOverTime: (query) => request((ctx) => buildRevenueOverTime(openReport(ctx, 'reports', query))),
  pipeline: (query) => request((ctx) => buildPipeline(openReport(ctx, 'reports', query))),
  winLoss: (query) => request((ctx) => buildWinLoss(openReport(ctx, 'reports', query))),
  lostAnalysis: (query) => request((ctx) => buildLost(openReport(ctx, 'reports', query))),
  salesPerformance: (query) => request((ctx) => buildSalesPerformance(ctx, openReport(ctx, 'reports', query))),
  followUpMetrics: (query) => request((ctx) => buildFollowUpMetrics(openReport(ctx, 'reports', query), ctx.now)),
  recentActivity: (query) => request((ctx) => buildRecentActivity(ctx, openReport(ctx, 'dashboard', query))),
  callList: (query) => request((ctx) => buildCallList(openReport(ctx, 'dashboard', query), ctx.now)),
  export: (body) => request((ctx) => buildExport(ctx, openReport(ctx, 'reports', body), body)),
  campaignReport: (query) => request((ctx) => buildCampaignReport(ctx, openReport(ctx, 'reports', query))),
  spendVsRevenue: (query) => request((ctx) => buildSpendVsRevenue(ctx, openReport(ctx, 'reports', query))),
  attribution: (query, mode) => request((ctx) => buildAttribution(ctx, openReport(ctx, 'reports', query), mode)),
  sourceRoi: (query) => request((ctx) => buildSourceRoi(openReport(ctx, 'reports', query))),
  funnelVelocity: (query, stuckDays) =>
    request((ctx) => buildFunnelVelocity(openReport(ctx, 'reports', query), stuckDays, ctx.now)),
  responseFollowUp: (query) =>
    request((ctx) => buildResponseFollowUp(openReport(ctx, 'reports', query), ctx.now)),
  forecast: (query) => request((ctx) => buildForecast(openReport(ctx, 'reports', query), ctx.now)),
  listSavedReports: () => request((ctx) => listSavedReports(ctx)),
  saveReport: (input) => request((ctx) => createSavedReport(ctx, input)),
  deleteSavedReport: (id) => request((ctx) => deleteSavedReport(ctx, id)),
}
