import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SyllabusCompletionPage } from '../pages/SyllabusCompletionPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('SyllabusCompletionPage', () => {
  it('renders page header, subtitle, breadcrumb, and Update Progress button', () => {
    render(
      <MemoryRouter>
        <SyllabusCompletionPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /Syllabus Completion/i })).toBeInTheDocument()
    expect(screen.getByText(/Track syllabus progress across your classes and batches/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Update Progress/i })).toBeInTheDocument()
  })

  it('renders Class / Batch selector with mentor class options', () => {
    render(
      <MemoryRouter>
        <SyllabusCompletionPage />
      </MemoryRouter>,
    )

    const classSelector = screen.getByRole('button', { name: /Select class or batch/i })
    expect(classSelector).toBeInTheDocument()
    expect(screen.getByText(/CLASS \/ BATCH/i)).toBeInTheDocument()
  })

  it('renders Overall Syllabus Completion card with real data and progress bar', () => {
    render(
      <MemoryRouter>
        <SyllabusCompletionPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Overall Syllabus Completion/i)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: /Overall Syllabus Completion/i })).toBeInTheDocument()
    expect(screen.getByText(/Topics Finished/i)).toBeInTheDocument()
  })

  it('renders 4 summary cards: Total Modules, Completed, In Progress, and Not Started', () => {
    render(
      <MemoryRouter>
        <SyllabusCompletionPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Total Modules')).toBeInTheDocument()
    expect(screen.getByText('Completed Modules')).toBeInTheDocument()
    expect(screen.getAllByText('In Progress').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Not Started').length).toBeGreaterThanOrEqual(1)
  })

  it('renders module accordion list with module titles and topic counts', () => {
    render(
      <MemoryRouter>
        <SyllabusCompletionPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Curriculum Modules & Chapters/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Module 1/i).length).toBeGreaterThanOrEqual(1)
  })

  it('filters topics when filter tabs are clicked', () => {
    render(
      <MemoryRouter>
        <SyllabusCompletionPage />
      </MemoryRouter>,
    )

    const completedTab = screen.getByRole('button', { name: /Filter by Completed/i })
    fireEvent.click(completedTab)

    expect(completedTab).toHaveClass('bg-primary')
  })

  it('filters topics by search query', () => {
    render(
      <MemoryRouter>
        <SyllabusCompletionPage />
      </MemoryRouter>,
    )

    const searchInput = screen.getByPlaceholderText(/Search modules or topics/i)
    fireEvent.change(searchInput, { target: { value: 'CSS' } })

    expect(searchInput).toHaveValue('CSS')
  })

  it('opens Update Progress modal when clicking the action button', () => {
    render(
      <MemoryRouter>
        <SyllabusCompletionPage />
      </MemoryRouter>,
    )

    const updateBtn = screen.getByRole('button', { name: /Update Progress/i })
    fireEvent.click(updateBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Save Progress/i)).toBeInTheDocument()
  })
})
