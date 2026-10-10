import { useMemo, useState } from 'react'
import { BriefcaseBusiness, MapPin,} from 'lucide-react'
import { NoAccess } from '@/components/common/NoAccess'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Button, Card, EmptyState, toast } from '@/components/ui'
import { getErrorMessage } from '@/services/api/errors'
import type { StudentJob } from '@/services/api/student-jobs'
import { usePermission } from '@/hooks/use-permission'
import { useStudentJobs } from '../hooks/useStudentJobs'
import CVResumeCard from '../components/CVResumeCard'
import JobSearchPage from '../components/JobSearchPage'

type SalaryFilter = 'all' | 'under-3' | '3-to-6' | '6-plus'

const NO_JOBS: StudentJob[] = []
const NO_APPLICATIONS: [] = []

function matchesSalary(job: StudentJob, filter: SalaryFilter): boolean {
  if (filter === 'all') return true
  if (job.salaryMinLpa === null && job.salaryMaxLpa === null) return false
  if (filter === 'under-3') return job.salaryMaxLpa !== null && job.salaryMaxLpa <= 3
  if (filter === '3-to-6') {
    return (
      (job.salaryMaxLpa === null || job.salaryMaxLpa >= 3) &&
      (job.salaryMinLpa === null || job.salaryMinLpa <= 6)
    )
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
  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    return jobs.filter((job) => {
      const searchFields = [job.title, job.company, job.description, job.location, ...job.skills]
      if (query && !searchFields.some((value) => value.toLocaleLowerCase().includes(query)))
        return false
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
    <div className="space-y-3">
      <PageHeader
        title="Job Search"
        description="Browse sample opportunities from the LMS job portal and track demo applications."
      />

      <div className="grid gap-3 sm:grid-cols-4">
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
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {applications.length}
            </p>
          </div>
        </Card>

        <div className="col col-span-2">
          <CVResumeCard />
        </div>
      </div>

      <JobSearchPage />

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
            description={
              jobs.length
                ? 'Try changing your search or filters.'
                : 'There are currently no internal LMS job listings.'
            }
            action={
              jobs.length ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
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
                            onSuccess: () =>
                              toast.success('Demo application recorded', {
                                description:
                                  'This is a mock LMS record and was not sent to an employer.',
                              }),
                            onError: (error) =>
                              toast.error('Could not record application', {
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
                    {job.skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                  {isApplied ? (
                    <span className="text-xs text-muted-foreground">
                      Application saved in this demo session
                    </span>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="space-y-2 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-foreground">External job sources</h2>
          <p className="text-sm text-muted-foreground">
            LinkedIn, Naukri, and Indeed feeds are not connected. Only clearly marked sample
            listings from the LMS demo portal appear here.
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
