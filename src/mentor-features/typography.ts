/**
 * Mentor Module Standard Typography System
 * Aligned strictly to the Mentor Dashboard & PageHeader source of truth.
 */

export const mentorTypography = {
  /** Page Header Main Title (24px semibold tracking-tight) */
  pageTitle: 'text-2xl font-semibold tracking-tight text-foreground',

  /** Page Subtitle / Description (14px text-muted-foreground) */
  pageDescription: 'text-sm text-muted-foreground',

  /** Section Upper Accent Label (e.g. QUICK ACTIONS) */
  sectionHeaderUpper: 'text-xs font-bold text-foreground tracking-tight uppercase text-muted-foreground/90',

  /** Section / Card Main Header */
  sectionTitle: 'text-base font-bold text-foreground tracking-tight',

  /** Card Title / Subheader */
  cardTitle: 'text-sm sm:text-base font-bold text-foreground',

  /** Secondary / Subtitle in Cards */
  cardSubtitle: 'text-xs text-muted-foreground',

  /** Item Title in Lists / Grids */
  itemTitle: 'text-xs sm:text-sm font-semibold text-foreground leading-tight',

  /** Stat / KPI Large Value */
  statValue: 'text-xl sm:text-2xl font-bold text-foreground tracking-tight',

  /** Stat Label */
  statLabel: 'text-xs font-medium text-muted-foreground',

  /** Table Column Header */
  tableHeader: 'text-xs font-semibold text-muted-foreground uppercase tracking-wider',

  /** Table Data Cell Primary */
  tableCell: 'text-xs font-medium text-foreground',

  /** Table Data Cell Muted */
  tableCellMuted: 'text-xs text-muted-foreground',

  /** Form Field Label */
  formLabel: 'text-xs font-semibold text-foreground',

  /** Form Field Input Text */
  formInput: 'text-xs text-foreground placeholder:text-muted-foreground',

  /** Form Error Text */
  formError: 'text-xs text-destructive',

  /** Badge & Tab Label */
  badgeText: 'text-xs font-semibold',
} as const

export default mentorTypography
