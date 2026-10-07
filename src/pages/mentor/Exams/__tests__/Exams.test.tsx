import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Exams } from '../Exams'

describe('Mentor Exams Page', () => {
  it('renders page header, overview stats, search bar, and exam cards', () => {
    render(
      <MemoryRouter>
        <Exams />
      </MemoryRouter>
    )

    // Header & Subtitle
    expect(screen.getByRole('heading', { name: /^Exams$/i })).toBeInTheDocument()
    expect(screen.getByText(/View and manage exams for your assigned classes/i)).toBeInTheDocument()

    // Create Exam button
    expect(screen.getByRole('button', { name: /Create Exam/i })).toBeInTheDocument()

    // Overview Metric Card
    expect(screen.getByText(/Exam Overview/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Exams/i)).toBeInTheDocument()

    // Exam cards from mock data
    expect(screen.getByRole('heading', { name: /Flutter Development/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Python Programming Basics/i })).toBeInTheDocument()
  })

  it('filters exams by tab', () => {
    render(
      <MemoryRouter>
        <Exams />
      </MemoryRouter>
    )

    // Click 'Upcoming' tab
    const upcomingTab = screen.getByRole('button', { name: /^Upcoming/i })
    fireEvent.click(upcomingTab)

    // Web Technologies is upcoming
    expect(screen.getByRole('heading', { name: /Web Technologies/i })).toBeInTheDocument()
    // Flutter Development is ongoing (today), so it should not appear in Upcoming tab
    expect(screen.queryByRole('heading', { name: /Flutter Development/i })).not.toBeInTheDocument()
  })

  it('filters exams dynamically by search query', () => {
    render(
      <MemoryRouter>
        <Exams />
      </MemoryRouter>
    )

    const searchInput = screen.getByPlaceholderText(/Search exams, subjects or classes/i)
    fireEvent.change(searchInput, { target: { value: 'Flutter' } })

    expect(screen.getByRole('heading', { name: /Flutter Development/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Python Programming Basics/i })).not.toBeInTheDocument()
  })

  it('filters exams by class dropdown selection', () => {
    render(
      <MemoryRouter>
        <Exams />
      </MemoryRouter>
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'Final Year' } })

    // Final Year exam is Flutter Development
    expect(screen.getByRole('heading', { name: /Flutter Development/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Python Programming Basics/i })).not.toBeInTheDocument()
  })
})
