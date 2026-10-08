import { BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'
import { ActiveCourseBanner } from '../components/ActiveCourseBanner'
import { CourseCard } from '../components/CourseCard'
import { CourseFilters } from '../components/CourseFilters'
import { CourseStatsOverview } from '../components/CourseStatsOverview'
import { CourseSyllabusModal } from '../components/CourseSyllabusModal'
import { useStudentCourses } from '../hooks/useStudentCourses'

export function MyCoursesPage() {
  const {
    courses,
    activeCourse,
    stats,
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    toggleBookmark,
    selectedCourseForSyllabus,
    isSyllabusOpen,
    openSyllabus,
    closeSyllabus,
  } = useStudentCourses()

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedTab('all')
    setSelectedCategory('All')
    setSortBy('recently_accessed')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Courses"
        description="Access all your enrolled courses, track module progress, review syllabus notes, and continue learning."
      />

      {/* Top 5 Stats Overview Cards */}
      <CourseStatsOverview stats={stats} />

      {/* Hero Banner for Currently Active Course */}
      {activeCourse && (
        <ActiveCourseBanner
          course={activeCourse}
          onOpenSyllabus={openSyllabus}
        />
      )}

      {/* Filters, Tabs & Search */}
      <CourseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={courses.length}
      />

      {/* Course Cards Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onToggleBookmark={toggleBookmark}
              onOpenSyllabus={openSyllabus}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">No courses found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No courses match your current search query or active filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-4 text-xs"
          >
            Reset Filters & Search
          </Button>
        </div>
      )}

      {/* Course Syllabus Modal */}
      <CourseSyllabusModal
        course={selectedCourseForSyllabus}
        open={isSyllabusOpen}
        onOpenChange={closeSyllabus}
      />
    </div>
  )
}

export default MyCoursesPage
