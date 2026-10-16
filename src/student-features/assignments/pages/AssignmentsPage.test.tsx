import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AssignmentsDeadlinesCard } from '@/student-features/student-Dashboard/Components/AssignmentsDeadlinesCard'
import { AssignmentsPage } from './AssignmentsPage'

function CurrentSearch() {
  const location = useLocation()
  return <output aria-label="Current search">{location.search}</output>
}

function renderAssignments(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CurrentSearch />
      <AssignmentsPage />
    </MemoryRouter>,
  )
}

describe('AssignmentsPage dashboard navigation', () => {
  it('opens the existing submit modal for the selected dashboard assignment without submitting it', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/student/dashboard']}>
        <CurrentSearch />
        <Routes>
          <Route path="/student/dashboard" element={<AssignmentsDeadlinesCard />} />
          <Route path="/student/assignments" element={<AssignmentsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: 'Submit Task' })[0])

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', {
      name: 'Submit: React Custom Hooks & Attendance Tracker Lab',
    })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Submit Task Solution' })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.getByLabelText('Current search')).toHaveTextContent(''))
    const assignmentCard = screen
      .getByRole('heading', { name: 'React Custom Hooks & Attendance Tracker Lab' })
      .closest('.group')
    expect(assignmentCard).not.toBeNull()
    expect(within(assignmentCard as HTMLElement).getByRole('button', { name: 'Submit Task' })).toBeInTheDocument()
  })

  it('does not open a modal during normal navigation', () => {
    renderAssignments('/student/assignments')

    expect(screen.getByRole('heading', { name: 'Assignments & Quizzes' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'React Custom Hooks & Attendance Tracker Lab' })).toBeInTheDocument()
  })

  it('shows a useful notice and keeps the assignment list for an invalid selected ID', async () => {
    renderAssignments('/student/assignments?id=missing-assignment')

    expect(await screen.findByText(/Assignment not found/)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'React Custom Hooks & Attendance Tracker Lab' })).toBeInTheDocument()
  })

  it('opens the existing quiz modal when the selected dashboard task is a quiz', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/student/dashboard']}>
        <Routes>
          <Route path="/student/dashboard" element={<AssignmentsDeadlinesCard />} />
          <Route path="/student/assignments" element={<AssignmentsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: 'Submit Task' })[1])

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('TypeScript Generics & Zod Validation Challenge')).toBeInTheDocument()
    expect(within(dialog).getByText(/Time Remaining:/)).toBeInTheDocument()
  })
})
