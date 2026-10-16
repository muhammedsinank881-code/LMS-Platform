/**
 * Mentor Module Standard Typography System
 * Aligned strictly to the Admin & Student design system source of truth.
 */

export const mentorTypography = {
  /** Page Header Main Title (20–22px mobile, 24px desktop) */
  pageTitle: 'text-xl sm:text-2xl font-semibold tracking-tight text-foreground',

  /** Page Subtitle / Description (12–14px) */
  pageDescription: 'text-xs sm:text-sm text-muted-foreground',

  /** Section Upper Accent Label */
  sectionHeaderUpper: 'text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground',

  /** Section / Card Main Header (16–18px) */
  sectionTitle: 'text-base sm:text-lg font-semibold text-foreground tracking-tight',

  /** Card Title / Subheader (14–16px) */
  cardTitle: 'text-sm sm:text-base font-semibold text-foreground',

  /** Secondary / Subtitle in Cards (11–12px) */
  cardSubtitle: 'text-[11px] sm:text-xs text-muted-foreground',

  /** Item Title in Lists / Grids (12–14px) */
  itemTitle: 'text-xs sm:text-sm font-semibold text-foreground leading-tight',

  /** Stat / KPI Large Value */
  statValue: 'text-lg sm:text-2xl font-semibold text-foreground tracking-tight',

  /** Stat Label (11–12px) */
  statLabel: 'text-[11px] sm:text-xs font-medium text-muted-foreground',

  /** Table Column Header (11–12px) */
  tableHeader: 'text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground',

  /** Table Data Cell Primary (12–14px) */
  tableCell: 'text-xs sm:text-sm font-medium text-foreground',

  /** Table Data Cell Muted (11–12px) */
  tableCellMuted: 'text-[11px] sm:text-xs text-muted-foreground',

  /** Form Field Label (12px) */
  formLabel: 'text-xs font-semibold text-foreground',

  /** Form Field Input Text (12–14px) */
  formInput: 'text-xs sm:text-sm text-foreground placeholder:text-muted-foreground',

  /** Form Error Text (11–12px) */
  formError: 'text-[11px] sm:text-xs text-destructive',

  /** Badge & Tab Label (10–12px) */
  badgeText: 'text-[10px] sm:text-xs font-medium',

  /** Button Text (12–14px) */
  buttonText: 'text-xs sm:text-sm font-medium',

  /** Navigation Labels (10–12px) */
  navLabel: 'text-[10px] sm:text-xs font-medium',
} as const

export default mentorTypography

