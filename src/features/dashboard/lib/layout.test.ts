import { describe, expect, it } from 'vitest'
import { dashboardLayout, showTeamReports } from './layout'

describe('dashboardLayout', () => {
  it('gives own scope the salesperson layout and wider scopes the manager layout', () => {
    expect(dashboardLayout('own')).toBe('salesperson')
    expect(dashboardLayout(null)).toBe('salesperson')
    expect(dashboardLayout('team')).toBe('manager')
    expect(dashboardLayout('all')).toBe('manager')
  })

  it('shows team reports only for workspace-wide access', () => {
    expect(showTeamReports('all')).toBe(true)
    expect(showTeamReports('team')).toBe(false)
    expect(showTeamReports('own')).toBe(false)
    expect(showTeamReports(null)).toBe(false)
  })
})
