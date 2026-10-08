import { useMemo, useState } from 'react'
import {
  MOCK_COURSES_DATA,
  MOCK_COURSE_STATS,
  type CourseCategory,
  type CourseStatusFilter,
  type StudentCourse,
} from '../data/coursesData'

export type SortOption = 'recently_accessed' | 'progress_desc' | 'rating' | 'title'

export function useStudentCourses() {
  const [courses, setCourses] = useState<StudentCourse[]>(MOCK_COURSES_DATA)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedTab, setSelectedTab] = useState<CourseStatusFilter>('all')
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('All')
  const [sortBy, setSortBy] = useState<SortOption>('recently_accessed')

  // Syllabus Modal State
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<StudentCourse | null>(null)
  const [isSyllabusOpen, setIsSyllabusOpen] = useState<boolean>(false)

  // Toggle Bookmark
  const toggleBookmark = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isBookmarked: !c.isBookmarked } : c))
    )
  }

  // Open Syllabus Modal
  const openSyllabus = (course: StudentCourse) => {
    setSelectedCourseForSyllabus(course)
    setIsSyllabusOpen(true)
  }

  const closeSyllabus = () => {
    setIsSyllabusOpen(false)
    setSelectedCourseForSyllabus(null)
  }

  // Active / Current Enrolled Course (Highest active progress or live)
  const activeCourse = useMemo(() => {
    return courses.find((c) => c.status === 'in_progress' && c.isLiveClassActive) ||
      courses.find((c) => c.status === 'in_progress') ||
      courses[0]
  }, [courses])

  // Filtered and Sorted Courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        // Tab Filter
        if (selectedTab === 'in_progress' && course.status !== 'in_progress') return false
        if (selectedTab === 'completed' && course.status !== 'completed') return false
        if (selectedTab === 'bookmarked' && !course.isBookmarked) return false

        // Category Filter
        if (selectedCategory !== 'All' && course.category !== selectedCategory) return false

        // Search Query
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase()
          const matchTitle = course.title.toLowerCase().includes(query)
          const matchCode = course.code.toLowerCase().includes(query)
          const matchInstructor = course.instructor.name.toLowerCase().includes(query)
          const matchDescription = course.description.toLowerCase().includes(query)
          if (!matchTitle && !matchCode && !matchInstructor && !matchDescription) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'progress_desc') return b.progress - a.progress
        if (sortBy === 'rating') return b.rating - a.rating
        if (sortBy === 'title') return a.title.localeCompare(b.title)
        // Default recently_accessed / in_progress first
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
        if (a.status !== 'in_progress' && b.status === 'in_progress') return 1
        return 0
      })
  }, [courses, searchQuery, selectedTab, selectedCategory, sortBy])

  // Dynamic Stats
  const stats = useMemo(() => {
    const totalEnrolled = courses.length
    const inProgressCount = courses.filter((c) => c.status === 'in_progress').length
    const completedCount = courses.filter((c) => c.status === 'completed').length
    const overallCompletionRate = Math.round(
      courses.reduce((acc, c) => acc + c.progress, 0) / (courses.length || 1)
    )

    return {
      totalEnrolled,
      inProgressCount,
      completedCount,
      totalHoursLearned: MOCK_COURSE_STATS.totalHoursLearned,
      overallCompletionRate,
    }
  }, [courses])

  return {
    courses: filteredCourses,
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
  }
}
