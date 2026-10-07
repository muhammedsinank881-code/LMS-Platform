import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Results } from '../Results'

describe('Mentor Results Page', () => {
  it('renders page header, overview stats, search bar, filters, and results table', () => {
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    )

    // Header & Subtitle
    expect(screen.getByRole('heading', { name: /^Results$/i })).toBeInTheDocument()
    expect(screen.getByText(/View and manage student examination results/i)).toBeInTheDocument()

    // Enter Results button
    expect(screen.getByRole('button', { name: /Enter Results/i })).toBeInTheDocument()

    // Overview Metrics Card
    expect(screen.getByText(/Results Overview/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Results/i)).toBeInTheDocument()
    expect(screen.getByText(/Average Score/i)).toBeInTheDocument()

    // Results table records
    expect(screen.getAllByText(/Muhammad Riyan/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Fathima Nida/i).length).toBeGreaterThan(0)
  })

  it('filters results by status tab', () => {
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    )

    // Click 'Pending' filter tab
    const pendingTab = screen.getByRole('button', { name: /^Pending/i })
    fireEvent.click(pendingTab)

    // Alan Shihab is pending
    expect(screen.getAllByText(/Alan Shihab/i).length).toBeGreaterThan(0)
    // Muhammad Riyan is published, so should not appear in Pending tab
    expect(screen.queryByText(/Muhammad Riyan/i)).not.toBeInTheDocument()
  })

  it('filters results dynamically by search query', () => {
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    )

    const searchInput = screen.getByPlaceholderText(/Search student, exam, subject, or ID/i)
    fireEvent.change(searchInput, { target: { value: 'BCA23001' } })

    expect(screen.getAllByText(/Muhammad Riyan/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Fathima Nida/i)).not.toBeInTheDocument()
  })

  it('filters results by class dropdown selection', () => {
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    )

    const selects = screen.getAllByRole('combobox')
    const classSelect = selects[0]
    fireEvent.change(classSelect, { target: { value: 'Final Year' } })

    // Siddharth Iyer is in Final Year
    expect(screen.getAllByText(/Siddharth Iyer/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Muhammad Riyan/i)).not.toBeInTheDocument()
  })

  it('filters results by exam dropdown selection', () => {
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    )

    const selects = screen.getAllByRole('combobox')
    const examSelect = selects[1]
    fireEvent.change(examSelect, { target: { value: 'Database Systems' } })

    // Fathima Nida took Database Systems
    expect(screen.getAllByText(/Fathima Nida/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Muhammad Riyan/i)).not.toBeInTheDocument()
  })
})
