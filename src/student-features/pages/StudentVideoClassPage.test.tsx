import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { StudentVideoClassPage } from './StudentVideoClassPage'
import { filterVisibleLessonBlocks, type ContentPreferences } from './learningContent'
import type { LessonContentBlock } from '../courses/data/coursesData'

function renderLearningPage() {
  return render(
    <MemoryRouter initialEntries={['/student/video-class?id=class-1']}>
      <StudentVideoClassPage />
    </MemoryRouter>,
  )
}

function renderCourseLesson(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StudentVideoClassPage />
    </MemoryRouter>,
  )
}

describe('StudentVideoClassPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('collapses and expands the syllabus and preferences independently', async () => {
    const user = userEvent.setup()
    renderLearningPage()

    await user.click(screen.getByRole('button', { name: 'Collapse course syllabus' }))
    expect(screen.queryByRole('heading', { name: 'Course syllabus' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Content' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Collapse content preferences' }))
    expect(screen.queryByRole('heading', { name: 'Content' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expand course syllabus' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand content preferences' }))
    expect(screen.getByRole('heading', { name: 'Content' })).toBeInTheDocument()
  })

  it('hides video material without removing it and restores it with Select all', async () => {
    const user = userEvent.setup()
    const { container } = renderLearningPage()

    expect(container.querySelector('video')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Videos'))
    expect(container.querySelector('video')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Select all' }))
    expect(container.querySelector('video')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getByRole('checkbox', { name: 'Videos' })).not.toBeChecked()
    expect(container.querySelector('video')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Select all' }))
    expect(container.querySelector('video')).toBeInTheDocument()
  })

  it('keeps syllabus selection and previous/next navigation synchronized', async () => {
    const user = userEvent.setup()
    renderLearningPage()

    await user.click(screen.getByRole('button', { name: 'Go to next lesson' }))
    expect(
      screen.getByRole('button', { name: /Advanced Recharts Analytics & Custom Tooltips/ }),
    ).toHaveAttribute('aria-current', 'page')

    await user.click(screen.getByRole('button', { name: /Module 1: Modern React 19/ }))
    await user.click(screen.getByRole('button', { name: /React 19 Compiler & Actions Overview/ }))
    expect(screen.getByRole('heading', { level: 2, name: 'React 19 Compiler & Actions Overview' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /React 19 Compiler & Actions Overview/ }),
    ).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to next lesson' })).toBeEnabled()
  })

  it('honors the course context when lesson ids are shared by different courses', () => {
    renderCourseLesson('/student/video-class?id=class-2&courseId=course-frontend-202')

    expect(screen.getByRole('heading', { level: 1, name: 'Frontend Engineering & React 19 Mastery' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Component Performance Optimization & React Profiler/ }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('filters content blocks without changing the order or source list', () => {
    const blocks: LessonContentBlock[] = [
      { id: 'intro', type: 'text', title: 'Introduction', body: 'Intro text' },
      { id: 'notes', type: 'notes', title: 'Notes', body: 'Study notes' },
      { id: 'video', type: 'video', title: 'Recorded lesson', url: '/lesson.mp4' },
      { id: 'resource', type: 'external-link', title: 'Reference', url: 'https://example.test' },
    ]
    const preferences: ContentPreferences = { notes: false, videos: true, externalLinks: true }

    const visible = filterVisibleLessonBlocks(blocks, preferences)

    expect(visible.map((block) => block.id)).toEqual(['intro', 'video', 'resource'])
    expect(blocks).toHaveLength(4)
  })

  it('persists completion without changing the seeded lesson status', async () => {
    const user = userEvent.setup()
    renderLearningPage()

    await user.click(screen.getByRole('button', { name: 'Mark lesson complete' }))

    expect(screen.getByText('Lesson complete')).toBeInTheDocument()
    expect(window.localStorage.getItem('student-course-learning-progress-v1')).toContain('class-1')
  })
})
