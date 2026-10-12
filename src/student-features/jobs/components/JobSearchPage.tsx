import { Search, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import type { SalaryFilter } from '../pages/StudentJobsPage'

interface JobSearchPageProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  workMode: string
  onWorkModeChange: (value: string) => void
  jobType: string
  onJobTypeChange: (value: string) => void
  location: string
  onLocationChange: (value: string) => void
  salary: SalaryFilter
  onSalaryChange: (value: SalaryFilter) => void
  locations: string[]
  onClearFilters: () => void
  resultsCount: number
  totalJobsCount?: number
}

export default function JobSearchPage({
  searchQuery,
  onSearchChange,
  workMode,
  onWorkModeChange,
  jobType,
  onJobTypeChange,
  location,
  onLocationChange,
  salary,
  onSalaryChange,
  locations,
  onClearFilters,
  resultsCount,
  totalJobsCount = 0,
}: JobSearchPageProps) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-surface/40 p-3 sm:p-4">
      <div className="flex items-center gap-2 w-full">
        <label htmlFor="job-search" className="text-sm font-medium text-foreground shrink-0">
          Search jobs
        </label>

        <div className="relative w-full">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="job-search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="pl-9 pr-9"
            aria-label="Search jobs"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
          Work arrangement
          <select
            value={workMode}
            onChange={(event) => onWorkModeChange(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            aria-label="Work arrangement"
          >
            <option value="all">Any arrangement</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
          Employment type
          <select
            value={jobType}
            onChange={(event) => onJobTypeChange(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            aria-label="Employment type"
          >
            <option value="all">Any job type</option>
            <option value="internship">Internship</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
          Location
          <select
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            aria-label="Location"
          >
            <option value="all">All locations</option>
            {locations.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
          Salary range
          <select
            value={salary}
            onChange={(event) => onSalaryChange(event.target.value as SalaryFilter)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            aria-label="Salary range"
          >
            <option value="all">Any salary</option>
            <option value="under-3">Under ₹3 LPA</option>
            <option value="3-to-6">₹3–6 LPA</option>
            <option value="6-plus">₹6+ LPA</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        <p className="text-sm text-muted-foreground">
          {totalJobsCount > 0
            ? `Showing ${resultsCount} of ${totalJobsCount} demo jobs`
            : resultsCount === 1
              ? 'Showing 1 matching job'
              : `Showing ${resultsCount} jobs`}
        </p>

        <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  )
}
