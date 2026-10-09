import { useMemo, useState } from 'react'
import { BriefcaseBusiness, ExternalLink, MapPin, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NoAccess } from '@/components/common/NoAccess'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Button, Card, EmptyState, Input, toast } from '@/components/ui'
import { getErrorMessage } from '@/services/api/errors'
import type { StudentJob } from '@/services/api/student-jobs'
import { usePermission } from '@/hooks/use-permission'
import { useStudentJobs } from '../hooks/useStudentJobs'

type SalaryFilter = 'all' | 'under-3' | '3-to-6' | '6-plus'

const NO_JOBS: StudentJob[] = []
const NO_APPLICATIONS: [] = []

const selectClassName =
  'h-10 min-w-0 rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function matchesSalary(job: StudentJob, filter: SalaryFilter): boolean {
  if (filter === 'all') return true
  if (job.salaryMinLpa === null && job.salaryMaxLpa === null) return false
  if (filter === 'under-3') return job.salaryMaxLpa !== null && job.salaryMaxLpa <= 3
  if (filter === '3-to-6') {
    return (job.salaryMaxLpa === null || job.salaryMaxLpa >= 3) &&
      (job.salaryMinLpa === null || job.salaryMinLpa <= 6)
  }
  return job.salaryMinLpa !== null && job.salaryMinLpa >= 6
}

function formatSalary(job: StudentJob): string {
  if (job.salaryMinLpa === null && job.salaryMaxLpa === null) return 'Salary not disclosed'
  if (job.salaryMinLpa === null) return `Up to ₹${job.salaryMaxLpa} LPA`
  if (job.salaryMaxLpa === null) return `₹${job.salaryMinLpa}+ LPA`
  return `₹${job.salaryMinLpa}–${job.salaryMaxLpa} LPA`
}

function formatLabel(value: string): string {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function StudentJobsContent() {
  const { overview, apply } = useStudentJobs()
  const [searchQuery, setSearchQuery] = useState('')
  const [workMode, setWorkMode] = useState('all')
  const [jobType, setJobType] = useState('all')
  const [location, setLocation] = useState('all')
  const [salary, setSalary] = useState<SalaryFilter>('all')

  const jobs = overview.data?.jobs ?? NO_JOBS
  const applications = overview.data?.applications ?? NO_APPLICATIONS
  const appliedJobIds = useMemo(
    () => new Set(applications.map((application) => application.jobId)),
    [applications],
  )
  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location))].sort((left, right) => left.localeCompare(right)),
    [jobs],
  )
  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    return jobs.filter((job) => {
      const searchFields = [job.title, job.company, job.description, job.location, ...job.skills]
      if (query && !searchFields.some((value) => value.toLocaleLowerCase().includes(query))) return false
      if (workMode !== 'all' && job.workMode !== workMode) return false
      if (jobType !== 'all' && job.jobType !== jobType) return false
      if (location !== 'all' && job.location !== location) return false
      if (!matchesSalary(job, salary)) return false
      return true
    })
  }, [jobs, searchQuery, workMode, jobType, location, salary])

  const clearFilters = () => {
    setSearchQuery('')
    setWorkMode('all')
    setJobType('all')
    setLocation('all')
    setSalary('all')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Job Search"
        description="Browse sample opportunities from the LMS job portal and track demo applications."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card
          className="flex items-center gap-3 p-4"
          role="status"
          aria-live="polite"
          aria-label={`${applications.length} ${applications.length === 1 ? 'job' : 'jobs'} applied to`}
        >
          <BriefcaseBusiness aria-hidden="true" className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Available jobs</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">{jobs.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <Badge tone="success">{applications.length}</Badge>
          <div>
            <p className="text-xs text-muted-foreground">Jobs you applied to</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">{applications.length}</p>
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <label htmlFor="job-search" className="text-sm font-medium text-foreground">
            Search by job name, skills, company, or keywords
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="job-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="e.g. Junior Software Developer, React.js Developer"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Work arrangement
            <select
              aria-label="Work arrangement"
              className={selectClassName}
              value={workMode}
              onChange={(event) => setWorkMode(event.target.value)}
            >
              <option value="all">Any arrangement</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Employment type
            <select
              aria-label="Employment type"
              className={selectClassName}
              value={jobType}
              onChange={(event) => setJobType(event.target.value)}
            >
              <option value="all">Any job type</option>
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Location
            <select
              aria-label="Location"
              className={selectClassName}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option value="all">All locations</option>
              {locations.map((jobLocation) => (
                <option key={jobLocation} value={jobLocation}>{jobLocation}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Salary (annual)
            <select
              aria-label="Salary range"
              className={selectClassName}
              value={salary}
              onChange={(event) => setSalary(event.target.value as SalaryFilter)}
            >
              <option value="all">Any salary</option>
              <option value="under-3">Under ₹3 LPA</option>
              <option value="3-to-6">₹3–6 LPA</option>
              <option value="6-plus">₹6+ LPA</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Showing {filteredJobs.length} of {jobs.length} demo jobs
          </p>
          <Button type="button" size="sm" variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </Card>

      {overview.isPending ? (
        <Card className="p-6 text-sm text-muted-foreground" role="status">
          Loading job listings…
        </Card>
      ) : overview.isError ? (
        <Card className="p-2 sm:p-4">
          <EmptyState
            icon={BriefcaseBusiness}
            title="We couldn’t load job listings"
            description={getErrorMessage(overview.error)}
            action={<Button onClick={() => void overview.refetch()}>Try again</Button>}
            tone="destructive"
            size="sm"
          />
        </Card>
      ) : filteredJobs.length === 0 ? (
        <Card className="p-2 sm:p-4">
          <EmptyState
            icon={BriefcaseBusiness}
            title={jobs.length ? 'No jobs match these filters' : 'No job listings are available'}
            description={jobs.length ? 'Try changing your search or filters.' : 'There are currently no internal LMS job listings.'}
            action={jobs.length ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : undefined}
            size="sm"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobIds.has(job.id)
            return (
              <Card key={job.id} className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">{job.title}</h2>
                      <Badge tone="info">{job.source}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex shrink-0 items-start">
                    {isApplied ? (
                      <Badge tone="success">Applied</Badge>
                    ) : (
                      <Button
                        size="sm"
                        loading={apply.isPending && apply.variables === job.id}
                        disabled={apply.isPending}
                        onClick={() => {
                          apply.mutate(job.id, {
                            onSuccess: () => toast.success('Demo application recorded', {
                              description: 'This is a mock LMS record and was not sent to an employer.',
                            }),
                            onError: (error) => toast.error('Could not record application', {
                              description: getErrorMessage(error),
                            }),
                          })
                        }}
                      >
                        Record demo application
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span>{formatLabel(job.workMode)}</span>
                  <span>{formatLabel(job.jobType)}</span>
                  <span>{formatSalary(job)}</span>
                  <span>{job.experience}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex flex-wrap gap-1.5" aria-label="Required skills">
                    {job.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
                  </div>
                  {isApplied ? (
                    <span className="text-xs text-muted-foreground">Application saved in this demo session</span>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-foreground">CV / resume</h2>
          <p className="text-sm text-muted-foreground">
            Secure CV upload and storage are not configured, so demo applications do not include a resume.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-1">
            <Link to="/student/profile">
              View profile CV status <ExternalLink aria-hidden="true" />
            </Link>
          </Button>
        </Card>

        <Card className="space-y-2 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-foreground">External job sources</h2>
          <p className="text-sm text-muted-foreground">
            LinkedIn, Naukri, and Indeed feeds are not connected. Only clearly marked sample listings from the LMS demo portal appear here.
          </p>
        </Card>
      </div>
    </div>
  )
}

export function StudentJobsPage() {
  const { role } = usePermission()
  if (role !== 'student') return <NoAccess />
  return <StudentJobsContent />
}

export default StudentJobsPage
