import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function JobSearchPage() {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="space-y-4 p-4 sm:p-6">
        <div className="space-y-2">
          <label htmlFor="job-search" className="text-sm font-medium text-foreground">
            Search jobs
          </label>

          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="job-search"
              placeholder="Job title, skills, company, or keywords"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
            Work arrangement
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="all">Any arrangement</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
            Employment type
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="all">Any job type</option>
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
            Location
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="all">All locations</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
            Salary (annual)
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="all">Any salary</option>
              <option value="under-3">Under ₹3 LPA</option>
              <option value="3-to-6">₹3–6 LPA</option>
              <option value="6-plus">₹6+ LPA</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">Explore available opportunities</p>

          <Button type="button" variant="outline" size="sm">
            Clear filters
          </Button>
        </div>
      </Card>

      {/* Job Results will go here in the next step */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Job opportunities</h2>

        <Card className="flex min-h-48 items-center justify-center p-6">
          <p className="text-center text-sm text-muted-foreground">
            Job listings will appear here.
          </p>
        </Card>
      </section>
    </div>
  )
}
