import type {
  Attribution,
  AttributionRow,
  BreakdownDimension,
  CampaignReport,
  Forecast,
  FunnelVelocity,
  ResponseFollowUp,
  SavedReport,
  SavedReportInput,
  SourceRoiRow,
  SpendRevenuePoint,
  BreakdownReport,
  CallListItem,
  CountSeries,
  DashboardSummary,
  FollowUpMetrics,
  FunnelStage,
  LostAnalysis,
  RecentActivityItem,
  ReportExportRequest,
  ReportExportResult,
  ReportQuery,
  RevenueSeries,
  SalesPerformanceRow,
  WinLossReport,
  DealsSummary,
} from '@/types'

/** Aggregated, already-scoped figures. Widgets never total raw lists themselves. */
export interface ReportsApiClient {
  summary(query: ReportQuery): Promise<DashboardSummary>
  leadsOverTime(query: ReportQuery): Promise<CountSeries>
  breakdown(query: ReportQuery, dimension: BreakdownDimension): Promise<BreakdownReport>
  funnel(query: ReportQuery): Promise<FunnelStage[]>
  revenueOverTime(query: ReportQuery): Promise<RevenueSeries>
  pipeline(query: ReportQuery): Promise<DealsSummary>
  winLoss(query: ReportQuery): Promise<WinLossReport>
  lostAnalysis(query: ReportQuery): Promise<LostAnalysis>
  salesPerformance(query: ReportQuery): Promise<SalesPerformanceRow[]>
  followUpMetrics(query: ReportQuery): Promise<FollowUpMetrics>
  recentActivity(query: ReportQuery): Promise<RecentActivityItem[]>
  callList(query: ReportQuery): Promise<CallListItem[]>
  export(request: ReportExportRequest): Promise<ReportExportResult>
  /** Spend-derived fields are null for roles without view-spend. */
  campaignReport(query: ReportQuery): Promise<CampaignReport>
  spendVsRevenue(query: ReportQuery): Promise<SpendRevenuePoint[]>
  attribution(query: ReportQuery, mode: Attribution): Promise<AttributionRow[]>
  sourceRoi(query: ReportQuery): Promise<SourceRoiRow[]>
  /** Deals in a stage longer than `stuckDays` are listed as stuck. */
  funnelVelocity(query: ReportQuery, stuckDays: number): Promise<FunnelVelocity>
  responseFollowUp(query: ReportQuery): Promise<ResponseFollowUp>
  forecast(query: ReportQuery): Promise<Forecast>
  listSavedReports(): Promise<SavedReport[]>
  saveReport(input: SavedReportInput): Promise<SavedReport>
  deleteSavedReport(id: string): Promise<void>
}
