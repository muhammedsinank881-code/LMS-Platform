import { useEffect, useMemo, useState } from 'react'
import { Bookmark, BriefcaseBusiness, MapPin } from 'lucide-react'
import { NoAccess } from '@/components/common/NoAccess'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  toast,
} from '@/components/ui'
import { getErrorMessage } from '@/services/api/errors'
import type { StudentJob } from '@/services/api/student-jobs'
import { usePermission } from '@/hooks/use-permission'
import { useStudentJobs } from '../hooks/useStudentJobs'
import CVResumeCard from '../components/CVResumeCard'
import JobSearchPage from '../components/JobSearchPage'

export type SalaryFilter = 'all' | 'under-3' | '3-to-6' | '6-plus'
type JobTab = 'all' | 'applied' | 'saved'

const NO_JOBS: StudentJob[] = []
const NO_APPLICATIONS: [] = []
const SAVED_JOBS_KEY = 'leadflow-student-saved-jobs'

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
  const [activeTab, setActiveTab] = useState<JobTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [workMode, setWorkMode] = useState('all')
  const [jobType, setJobType] = useState('all')
  const [location, setLocation] = useState('all')
  const [salary, setSalary] = useState<SalaryFilter>('all')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [cv, setCv] = useState<{ name: string; url: string; size: number | null } | null>(null)
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(SAVED_JOBS_KEY)
      const parsed = raw ? (JSON.parse(raw) as string[]) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(savedJobIds))
  }, [savedJobIds])

  const jobs = overview.data?.jobs ?? NO_JOBS
  const applications = overview.data?.applications ?? NO_APPLICATIONS
  const appliedJobIds = useMemo(
    () => new Set(applications.map((application) => application.jobId)),
    [applications],
  )
  const savedSet = useMemo(() => new Set(savedJobIds), [savedJobIds])

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    return jobs.filter((job) => {
      const searchFields = [job.title, job.company, job.description, job.location, ...job.skills]
      if (query && !searchFields.some((value) => value.toLocaleLowerCase().includes(query))) {
        return false
      }
      if (workMode !== 'all' && job.workMode !== workMode) return false
      if (jobType !== 'all' && job.jobType !== jobType) return false
      if (location !== 'all' && job.location !== location) return false
      if (!matchesSalary(job, salary)) return false
      return true
    })
  }, [jobs, searchQuery, workMode, jobType, location, salary])

  const tabResults = useMemo(() => {
    if (activeTab === 'applied') {
      return filteredJobs.filter((job) => appliedJobIds.has(job.id))
    }
    if (activeTab === 'saved') {
      return filteredJobs.filter((job) => savedSet.has(job.id))
    }
    return filteredJobs
  }, [activeTab, filteredJobs, appliedJobIds, savedSet])

  const selectedJob = tabResults.find((job) => job.id === selectedJobId) ?? tabResults[0] ?? null

  const clearFilters = () => {
    setSearchQuery('')
    setWorkMode('all')
    setJobType('all')
    setLocation('all')
    setSalary('all')
  }

  const handleSaveToggle = (jobId: string) => {
    setSavedJobIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    )
  }

  const handleUploadCv = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be 5 MB or less.')
    }

    const isValid = /\.(pdf|doc|docx)$/i.test(file.name)
    const isMimeAllowed =
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    if (!isValid || !isMimeAllowed) {
      throw new Error('Please select a PDF, DOC, or DOCX file.')
    }

    const previewUrl = URL.createObjectURL(file)
    setCv({ name: file.name, url: previewUrl, size: file.size })
  }

  const handleRemoveCv = async () => {
    if (!cv) return
    setCv(null)
    if (cv.url.startsWith('blob:')) URL.revokeObjectURL(cv.url)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Job Search"
        description="Browse sample opportunities from the LeadFlow job portal and track demo applications."
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-[58%]">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as JobTab)}>
            <TabsList className="w-full justify-start overflow-x-auto border-b border-border bg-transparent pb-2">
              <TabsTrigger value="all" className="gap-1.5 text-xs">
                All Jobs
                <Badge tone="neutral" className="h-5 min-w-5 rounded-full px-1.5">
                  {jobs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="applied" className="gap-1.5 text-xs">
                Applied
                <Badge tone="neutral" className="h-5 min-w-5 rounded-full px-1.5">
                  {applications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-1.5 text-xs">
                Saved
                <Badge tone="neutral" className="h-5 min-w-5 rounded-full px-1.5">
                  {savedJobIds.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              role="status"
              aria-live="polite"
              aria-label={`${applications.length} ${applications.length === 1 ? 'job' : 'jobs'} applied to`}
            >
              {applications.length}
            </span>
            <span>Jobs you applied to</span>
          </div>
        </div>

        <div className="w-full xl:max-w-[40%]">
          <CVResumeCard
            cvUrl={cv?.url ?? null}
            cvName={cv?.name ?? null}
            cvSize={cv?.size ?? null}
            onUpload={handleUploadCv}
            onRemove={handleRemoveCv}
          />
        </div>
      </div>

      <JobSearchPage
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        workMode={workMode}
        onWorkModeChange={setWorkMode}
        jobType={jobType}
        onJobTypeChange={setJobType}
        location={location}
        onLocationChange={setLocation}
        salary={salary}
        onSalaryChange={setSalary}
        locations={[...new Set(jobs.map((job) => job.location))]}
        onClearFilters={clearFilters}
        resultsCount={tabResults.length}
        totalJobsCount={jobs.length}
      />

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
      ) : tabResults.length === 0 ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,45%)_minmax(0,55%)]">
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
          <Card className="p-4 sm:p-5">
            <EmptyState
              icon={BriefcaseBusiness}
              title="No job selected"
              description="Choose a job from the list to see the full details."
              size="sm"
            />
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,45%)_minmax(0,55%)]">
          <div className="space-y-3">
            <div className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
              {tabResults.map((job) => {
                const isApplied = appliedJobIds.has(job.id)
                const isSaved = savedSet.has(job.id)
                const isSelected = selectedJob?.id === job.id

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    className={`w-full rounded-md border bg-surface p-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/40 ${
                      isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {job.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {job.source}
                        </p>
                      </div>
                      {isApplied ? (
                        <Badge tone="success" className="shrink-0">
                          Applied
                        </Badge>
                      ) : isSaved ? (
                        <Badge tone="info" className="shrink-0">
                          Saved
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {job.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden="true" className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span>{formatLabel(job.workMode)}</span>
                      <span>{formatLabel(job.jobType)}</span>
                      <span>{formatSalary(job)}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Required skills">
                      {job.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} className="!rounded-full !px-2 !py-0.5 text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedJob ? (
            <Card className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {selectedJob.source}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">
                    {selectedJob.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                </div>
                <Badge tone="info">{selectedJob.location}</Badge>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="h-4 w-4" /> {selectedJob.location}
                </span>
                <span>{formatLabel(selectedJob.workMode)}</span>
                <span>{formatLabel(selectedJob.jobType)}</span>
                <span>{formatSalary(selectedJob)}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {appliedJobIds.has(selectedJob.id) ? (
                  <Button type="button" variant="secondary" disabled>
                    Applied
                  </Button>
                ) : (
                  <Button
                    type="button"
                    loading={apply.isPending && apply.variables === selectedJob.id}
                    disabled={apply.isPending}
                    onClick={() => {
                      apply.mutate(selectedJob.id, {
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
                    Apply now
                  </Button>
                )}
                <Button
                  type="button"
                  variant={savedSet.has(selectedJob.id) ? 'secondary' : 'outline'}
                  onClick={() => handleSaveToggle(selectedJob.id)}
                >
                  {savedSet.has(selectedJob.id) ? 'Saved' : 'Save job'}
                </Button>
              </div>

              {appliedJobIds.has(selectedJob.id) ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Application saved in this demo session
                </p>
              ) : null}

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Experience
                  </p>
                  <p className="mt-1 text-sm text-foreground">{selectedJob.experience}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Description
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {selectedJob.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Skills
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 sm:p-5">
              <EmptyState
                icon={BriefcaseBusiness}
                title="No job selected"
                description="Choose a job from the list to see the full details."
                size="sm"
              />
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="space-y-2 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Bookmark aria-hidden="true" className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">External job sources</h2>
          </div>
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
