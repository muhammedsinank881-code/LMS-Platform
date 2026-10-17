import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle, TrendingUp, Users } from 'lucide-react'
import { Badge, Card, CardContent, ProgressBar, Skeleton, type BadgeTone } from '@/components/ui'

interface DashboardSummaryCardsProps {
  totalStudents: number
  allClassesCount: number
  activeClassesCount: number
  attendanceRate: number
  syllabusProgress?: number | null
  syllabusBadgeText?: string
  syllabusBadgeTone?: BadgeTone
  syllabusPhaseText?: string
  isLoading?: boolean
}

export function DashboardSummaryCards({
  totalStudents,
  allClassesCount,
  activeClassesCount,
  attendanceRate,
  syllabusProgress = null,
  syllabusBadgeText,
  syllabusBadgeTone,
  syllabusPhaseText,
  isLoading = false,
}: DashboardSummaryCardsProps) {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const hasSyllabusData = typeof syllabusProgress === 'number' && !isNaN(syllabusProgress)
  const resolvedSyllabusValue = hasSyllabusData ? `${syllabusProgress}%` : '--'

  const resolvedSyllabusBadgeText =
    syllabusBadgeText ||
    (hasSyllabusData
      ? syllabusProgress === 100
        ? 'Completed'
        : syllabusProgress >= 75
        ? 'On Track'
        : syllabusProgress >= 50
        ? 'In Progress'
        : 'Behind'
      : 'No Data')

  const resolvedSyllabusBadgeTone: BadgeTone =
    syllabusBadgeTone ||
    (hasSyllabusData
      ? syllabusProgress >= 75
        ? 'success'
        : syllabusProgress >= 50
        ? 'primary'
        : 'warning'
      : 'neutral')

  const resolvedSyllabusPhase =
    syllabusPhaseText ||
    (hasSyllabusData
      ? syllabusProgress === 100
        ? 'All Modules Completed'
        : syllabusProgress >= 90
        ? 'Final Review & Wrap-up'
        : syllabusProgress >= 75
        ? 'Advanced Modules Phase'
        : syllabusProgress >= 50
        ? 'Mid-Term Evaluation Phase'
        : syllabusProgress > 0
        ? 'Foundation Modules Phase'
        : 'Curriculum Not Started'
      : 'No syllabus data')

  const cards = [
    {
      id: 'students',
      label: 'Total Students',
      value: totalStudents,
      title: 'Active Enrolled Students',
      subtitle: `BCA · Across ${allClassesCount} Batches`,
      badgeText: '+12 this month',
      badgeTone: 'success' as const,
      icon: Users,
      actionText: 'View Students',
      actionPath: '/mentor/students',
      progress: null as number | null,
    },
    {
      id: 'classes',
      label: 'Active Classes',
      value: activeClassesCount,
      title: 'Live Assigned Batches',
      subtitle: `BCA · ${allClassesCount} Total Curriculums`,
      badgeText: 'Active Now',
      badgeTone: 'info' as const,
      icon: BookOpen,
      actionText: 'View Classes',
      actionPath: '/mentor/classes',
      progress: null as number | null,
    },
    {
      id: 'attendance',
      label: 'Avg Attendance',
      value: `${attendanceRate}%`,
      title: 'Cohort Attendance Rate',
      subtitle: 'Verified via Live Telemetry',
      badgeText: '+5% vs last month',
      badgeTone: 'primary' as const,
      icon: TrendingUp,
      actionText: 'View Attendance',
      actionPath: '/mentor/attendance',
      progress: null as number | null,
    },
    {
      id: 'syllabus',
      label: 'Curriculum Progress',
      value: resolvedSyllabusValue,
      title: 'Syllabus Completion',
      subtitle: resolvedSyllabusPhase,
      badgeText: resolvedSyllabusBadgeText,
      badgeTone: resolvedSyllabusBadgeTone,
      icon: CheckCircle,
      actionText: 'View Syllabus',
      actionPath: '/mentor/syllabus-completion',
      progress: hasSyllabusData ? syllabusProgress : null,
    },
  ]

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft
      const cardWidth = carouselRef.current.offsetWidth * 0.85
      const index = Math.round(scrollLeft / cardWidth)
      setActiveIndex(Math.min(Math.max(index, 0), cards.length - 1))
    }
  }

  const renderCardContent = (card: (typeof cards)[0]) => {
    const Icon = card.icon
    return (
      <Card
        key={card.id}
        className="bg-gradient-to-br from-surface to-muted/30 border-border shadow-2xs rounded-2xl transition-all hover:shadow-sm hover:border-primary/40 select-none cursor-pointer group flex flex-col justify-between h-full min-h-[132px] sm:min-h-[136px]"
        onClick={() => navigate(card.actionPath)}
      >
        <CardContent className="p-3 sm:px-3.5 sm:py-2.5 flex flex-col justify-between h-full gap-1.5">
          {/* Top: Label + Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-6 w-6 rounded-md bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {card.label}
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-14 rounded-full" />
            ) : (
              <Badge
                tone={card.badgeTone}
                size="sm"
                className="text-[10px] font-semibold shrink-0 py-0 px-1.5 h-5 leading-none"
              >
                {card.badgeText}
              </Badge>
            )}
          </div>

          {/* Middle: Big Stat + Description + Optional Progress Indicator */}
          <div className="space-y-0.5 my-auto">
            {isLoading ? (
              <div className="space-y-1.5 py-0.5">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-none">
                  {card.value}
                </div>
                <div className="text-xs font-bold text-foreground truncate leading-tight pt-1">
                  {card.title}
                </div>
                <div className="text-[11px] text-muted-foreground truncate leading-tight">
                  {card.subtitle}
                </div>
                {card.progress !== undefined && card.progress !== null ? (
                  <div className="pt-1.5 w-full">
                    <ProgressBar
                      value={card.progress}
                      size="sm"
                      tone="primary"
                      aria-label="Syllabus Completion"
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Bottom: Action link */}
          <div className="flex items-center gap-1 text-xs font-bold text-primary pt-0.5">
            <span>{card.actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {/* Mobile view (< md): Horizontal scroll carousel with snap */}
      <div className="md:hidden">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-1.5 pt-0.5 snap-x snap-mandatory scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0"
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="min-w-[85%] sm:min-w-[320px] max-w-[340px] shrink-0 snap-center"
            >
              {renderCardContent(card)}
            </div>
          ))}
        </div>

        {/* Pagination Dot Indicators (mobile only) */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {cards.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                idx === activeIndex
                  ? 'w-4 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tablet & Desktop view (>= md): Responsive multi-column grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => renderCardContent(card))}
      </div>
    </div>
  )
}
