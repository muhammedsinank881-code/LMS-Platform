import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MyClassesPage as MyClasses } from '../pages/MyClassesPage'

describe('MyClasses Page', () => {
  it('renders page header, summary stats, filter tabs, and class cards', () => {
    render(
      <MemoryRouter>
        <MyClasses />
      </MemoryRouter>
    )

    // Page title & subtitle
    expect(screen.getByRole('heading', { name: /My Classes/i })).toBeInTheDocument()
    expect(screen.getByText(/View and manage the classes assigned to you/i)).toBeInTheDocument()

    // Add Class button
    expect(screen.getByRole('button', { name: /Add Class/i })).toBeInTheDocument()

    // Summary statistics
    expect(screen.getByText(/Active Classes/i)).toBeInTheDocument()

    // Class cards
    expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument()
    expect(screen.getByText(/Web Development Fundamentals/i)).toBeInTheDocument()
  })

  it('filters classes by active tab', async () => {
    render(
      <MemoryRouter>
        <MyClasses />
      </MemoryRouter>
    )

    // Click 'Active' filter tab
    const activeTab = screen.getByRole('tab', { name: /^Active/i })
    await userEvent.click(activeTab)

    // Active class should be visible
    expect(screen.getByText(/Web Development Fundamentals/i)).toBeInTheDocument()

    // Completed class should not be visible when Active tab is selected
    expect(screen.queryByText(/Data Structures & Algorithms/i)).not.toBeInTheDocument()
  })

  it('filters classes dynamically by search query', () => {
    render(
      <MemoryRouter>
        <MyClasses />
      </MemoryRouter>
    )

    const searchInput = screen.getByPlaceholderText(/Search classes, courses, or codes/i)
    fireEvent.change(searchInput, { target: { value: 'BCA-103' } })

    // Data Structures & Algorithms has code BCA-103
    expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument()
    expect(screen.queryByText(/Web Development Fundamentals/i)).not.toBeInTheDocument()
  })
})
