import { useState, type FormEvent } from 'react'
import {
  Award,
  BriefcaseBusiness,
  Check,
  ExternalLink,
  FileBadge,
  FileText,
  Code2,
  GraduationCap,
  LockKeyhole,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { FormAlert, FormField } from '@/components/common/FormField'
import { NoAccess } from '@/components/common/NoAccess'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ProgressBar,
  toast,
} from '@/components/ui'
import { getErrorMessage } from '@/services/api/errors'
import type { ExternalStudentCertificate } from '@/services/api/student-profile'
import { useUpdateProfile } from '@/features/settings/hooks/use-settings'
import { MOCK_COURSES_DATA } from '@/student-features/courses/data/coursesData'
import { useCertificate } from '@/student-features/certificate/hooks/useCertificate'
import { usePermission } from '@/hooks/use-permission'
import { useAuthStore } from '@/store/auth-store'
import { useStudentProfile } from '../hooks/useStudentProfile'

const MAX_PROFILE_PHOTO_BYTES = 250_000

function SectionCard({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string
  description?: string
  icon: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-primary">{icon}</span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  )
}

function ReadOnlyValue({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex min-h-9 items-center gap-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm text-foreground">
        <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="break-words">{value || 'Not available in current student records'}</span>
      </div>
    </div>
  )
}

function StudentProfileContent() {
  const user = useAuthStore((state) => state.user)
  const setSessionAvatar = useAuthStore((state) => state.setSession)
  const tenant = useAuthStore((state) => state.tenant)
  const tenants = useAuthStore((state) => state.tenants)
  const token = useAuthStore((state) => state.token)
  const { profile, update, addCertificate, updateCertificate, deleteCertificate } = useStudentProfile()
  const updateUserProfile = useUpdateProfile()
  const [isEditingApaar, setIsEditingApaar] = useState(false)
  const [apaarInput, setApaarInput] = useState('')
  const [apaarError, setApaarError] = useState('')
  const [isEditingCareer, setIsEditingCareer] = useState(false)
  const [careerInput, setCareerInput] = useState({ github: '', linkedIn: '', portfolio: '' })
  const [careerError, setCareerError] = useState('')
  const [certificateToEdit, setCertificateToEdit] = useState<ExternalStudentCertificate | null>(null)
  const [isAddingCertificate, setIsAddingCertificate] = useState(false)
  const [certificateError, setCertificateError] = useState('')
  const [photoError, setPhotoError] = useState('')

  const profileData = profile.data
  const courses = MOCK_COURSES_DATA.filter((course) => course.status === 'in_progress')
  const { cert, isEarned } = useCertificate()
  const issuedCertificates =
    isEarned && cert.issuedDate
      ? [{
          id: cert.id,
          title: cert.title,
          issuer: cert.issuer,
          issueDate: cert.issuedDate,
          credentialId: cert.certificateNumber ?? cert.id,
        }]
      : []
  const identityFields = [user?.name?.trim(), user?.email?.trim()]
  const completeness = Math.round(
    (identityFields.filter((value) => Boolean(value)).length / identityFields.length) * 100,
  )

  if (profile.isPending) {
    return (
      <Card className="p-6" role="status" aria-live="polite">
        Loading your student profile…
      </Card>
    )
  }

  if (profile.isError || !profileData) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={UserRound}
          title="We couldn’t load your profile"
          description={getErrorMessage(profile.error)}
          action={<Button onClick={() => void profile.refetch()}>Try again</Button>}
          tone="destructive"
          size="sm"
        />
      </Card>
    )
  }

  const saveApaar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = apaarInput.trim()
    if (value && !/^\d{12}$/.test(value)) {
      setApaarError('Enter a 12-digit APAAR ID, or leave it blank.')
      return
    }
    setApaarError('')
    update.mutate(
      { apaarId: value || null },
      {
        onSuccess: () => {
          setIsEditingApaar(false)
          toast.success('APAAR ID saved')
        },
      },
    )
  }

  const startEditingCareer = () => {
    setCareerInput({
      github: profileData.careerLinks.github ?? '',
      linkedIn: profileData.careerLinks.linkedIn ?? '',
      portfolio: profileData.careerLinks.portfolio ?? '',
    })
    setCareerError('')
    setIsEditingCareer(true)
  }

  const saveCareer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = Object.entries(careerInput)
    for (const [key, value] of values) {
      if (!value.trim()) continue
      try {
        const parsed = new URL(value.trim())
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error()
      } catch {
        setCareerError(`${key === 'linkedIn' ? 'LinkedIn' : key === 'github' ? 'GitHub' : 'Portfolio'} URL must be a valid HTTP or HTTPS link.`)
        return
      }
    }
    setCareerError('')
    update.mutate(
      {
        careerLinks: {
          github: careerInput.github.trim() || null,
          linkedIn: careerInput.linkedIn.trim() || null,
          portfolio: careerInput.portfolio.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setIsEditingCareer(false)
          toast.success('Career links saved')
        },
      },
    )
  }

  const uploadPhoto = (file: File | undefined) => {
    setPhotoError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file.')
      return
    }
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      setPhotoError('Choose an image smaller than 250 KB.')
      return
    }
    const reader = new FileReader()
    reader.onerror = () => setPhotoError('The selected image could not be read.')
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPhotoError('The selected image could not be read.')
        return
      }
      updateUserProfile.mutate(
        { avatarUrl: reader.result },
        {
          onSuccess: (saved) => {
            if (user && tenant && token) {
              setSessionAvatar({
                user: { ...user, avatarUrl: saved.avatarUrl },
                tenant,
                tenants,
                token,
              })
            }
            toast.success('Profile photo updated')
          },
          onError: (error) => setPhotoError(getErrorMessage(error)),
        },
      )
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoError('')
    updateUserProfile.mutate(
      { avatarUrl: null },
      {
        onSuccess: (saved) => {
          if (user && tenant && token) {
            setSessionAvatar({
              user: { ...user, avatarUrl: saved.avatarUrl },
              tenant,
              tenants,
              token,
            })
          }
          toast.success('Profile photo removed')
        },
        onError: (error) => setPhotoError(getErrorMessage(error)),
      },
    )
  }

  const saveCertificate = (values: CertificateFormValues) => {
    setCertificateError('')
    const input = {
      title: values.title.trim(),
      issuer: values.issuer.trim(),
      issueDate: values.issueDate || null,
      credentialUrl: values.credentialUrl.trim() || null,
    }
    const onSuccess = () => {
      setCertificateToEdit(null)
      setIsAddingCertificate(false)
      toast.success(certificateToEdit ? 'Certificate updated' : 'Certificate added')
    }
    const onError = (error: Error) => setCertificateError(getErrorMessage(error))

    if (certificateToEdit) {
      updateCertificate.mutate({ id: certificateToEdit.id, patch: input }, { onSuccess, onError })
    } else {
      addCertificate.mutate(input, { onSuccess, onError })
    }
  }

  const confirmDeleteCertificate = (certificate: ExternalStudentCertificate) => {
    if (!window.confirm(`Remove "${certificate.title}" from your additional certificates?`)) return
    deleteCertificate.mutate(certificate.id, {
      onSuccess: () => toast.success('Certificate removed'),
    })
  }

  const closeCertificateDialog = () => {
    setCertificateToEdit(null)
    setIsAddingCertificate(false)
    setCertificateError('')
  }

  const avatar = user?.avatarUrl

  return (
    <div className="space-y-5">
      <PageHeader
        title="Student Profile"
        description="View your official student information and manage your personal profile details."
      />

      <Card className="flex flex-col gap-4 border-primary/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={user?.name ?? 'Student'} src={avatar} size="xl" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">{user?.name || 'Student'}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Student ID: not available in the current account record
            </p>
          </div>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Profile completeness</span>
            <span className="font-semibold tabular-nums text-primary">{completeness}%</span>
          </div>
          <ProgressBar value={completeness} size="sm" aria-label={`Profile completeness ${completeness}%`} />
          <p className="text-[11px] text-muted-foreground">
            Based on required account identity fields. Optional details do not reduce completion.
          </p>
        </div>
      </Card>

      <SectionCard
        title="Personal information"
        description="Official identity details are read-only. You can update your photo and optional APAAR ID."
        icon={<UserRound className="h-4 w-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ReadOnlyValue label="Student ID" value={null} />
          <ReadOnlyValue label="Full name" value={user?.name} />
          <ReadOnlyValue label="Date of birth" value={null} />
          <ReadOnlyValue label="Address" value={null} />
          <ReadOnlyValue label="Email address" value={user?.email} />
          <ReadOnlyValue label="Phone number" value={profileData.account.phone} />
        </div>
        <div className="mt-4 grid gap-4 border-t border-border/60 pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Profile photo</p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex min-h-9 cursor-pointer items-center rounded-md border border-input bg-surface px-3 text-xs font-medium text-foreground hover:bg-muted focus-within:ring-2 focus-within:ring-ring">
                {updateUserProfile.isPending ? 'Updating…' : avatar ? 'Replace photo' : 'Upload photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Upload profile photo"
                  disabled={updateUserProfile.isPending}
                  onChange={(event) => {
                    uploadPhoto(event.currentTarget.files?.[0])
                    event.currentTarget.value = ''
                  }}
                />
              </label>
              {avatar && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={updateUserProfile.isPending}
                  onClick={removePhoto}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">Image files only, up to 250 KB.</p>
            {photoError && <p role="alert" className="text-xs text-destructive">{photoError}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">APAAR ID (optional)</p>
              {!isEditingApaar && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setApaarInput(profileData.apaarId ?? '')
                    setApaarError('')
                    setIsEditingApaar(true)
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {profileData.apaarId ? 'Edit' : 'Add'}
                </Button>
              )}
            </div>
            {isEditingApaar ? (
              <form onSubmit={saveApaar} className="space-y-2">
                <FormField
                  id="student-apaar-id"
                  label="12-digit APAAR ID"
                  error={apaarError}
                  hint="Leave blank to remove this optional ID."
                >
                  {(control) => (
                    <Input
                      {...control}
                      value={apaarInput}
                      maxLength={12}
                      inputMode="numeric"
                      autoComplete="off"
                      onChange={(event) => setApaarInput(event.target.value.replace(/\D/g, ''))}
                    />
                  )}
                </FormField>
                <div className="flex gap-2">
                  <Button size="sm" type="submit" loading={update.isPending}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingApaar(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <ReadOnlyValue label="Current APAAR ID" value={profileData.apaarId} />
            )}
          </div>
        </div>
        <OfficialInformationNotice />
      </SectionCard>

      <SectionCard
        title="Family information"
        description="Private official details are visible only to the student and authorized staff."
        icon={<ShieldCheck className="h-4 w-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <ReadOnlyValue label="Father’s name" value={null} />
          <ReadOnlyValue label="Mother’s name" value={null} />
          <ReadOnlyValue label="Parent / guardian phone" value={null} />
        </div>
        <OfficialInformationNotice />
      </SectionCard>

      <SectionCard
        title="Education history and academic marks"
        description="Education records are system-managed and will appear here when linked to your student account."
        icon={<GraduationCap className="h-4 w-4" />}
      >
        <EmptyState
          icon={GraduationCap}
          title="No linked education records"
          description="The current application does not expose student admission or lead education records to this profile."
          size="sm"
        />
        <OfficialInformationNotice />
      </SectionCard>

      <SectionCard
        title="Current courses and progress"
        description="Course enrollment and progress are system-managed."
        icon={<BriefcaseBusiness className="h-4 w-4" />}
      >
        {courses.length ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Progress is shown from the existing student course module.
            </p>
            {courses.map((course) => (
              <div key={course.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{course.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.code} · Enrollment status: {course.status.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge tone="primary" appearance="soft" size="sm">{course.progress}%</Badge>
                </div>
                <ProgressBar value={course.progress} size="sm" aria-label={`${course.title} progress`} className="mt-3" />
                <div className="mt-2 flex justify-end">
                  <Link to="/student/courses" className="text-xs font-medium text-primary hover:underline">
                    Open My Courses
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={GraduationCap} title="No active courses" description="There are no in-progress courses in the current course data." size="sm" />
        )}
      </SectionCard>

      <SectionCard
        title="Certificates earned through this LMS"
        description="Issued certificates are shown separately from certificates you add yourself."
        icon={<Award className="h-4 w-4" />}
        action={<Link to="/student/certificates" className="text-xs font-medium text-primary hover:underline">View certificate progress</Link>}
      >
        {issuedCertificates.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {issuedCertificates.map((certificate) => (
              <div key={certificate.id} className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                  <Award className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{certificate.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{certificate.issuer} · {certificate.issueDate}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">Credential ID: {certificate.credentialId}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Award} title="No LMS certificates yet" description="Certificates will appear here after they are issued by the LMS." size="sm" />
        )}
      </SectionCard>

      <SectionCard
        title="Career links"
        description="Manage links you may reuse in future career services. These are not visible to other students."
        icon={<Code2 className="h-4 w-4" />}
        action={!isEditingCareer && (
          <Button size="sm" variant="outline" onClick={startEditingCareer}>
            <Pencil className="h-3.5 w-3.5" /> {Object.values(profileData.careerLinks).some(Boolean) ? 'Edit links' : 'Add links'}
          </Button>
        )}
      >
        {isEditingCareer ? (
          <form onSubmit={saveCareer} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id="career-github" label="GitHub profile URL">
                {(control) => <Input {...control} type="url" value={careerInput.github} placeholder="https://github.com/username" onChange={(event) => setCareerInput({ ...careerInput, github: event.target.value })} />}
              </FormField>
              <FormField id="career-linkedin" label="LinkedIn profile URL">
                {(control) => <Input {...control} type="url" value={careerInput.linkedIn} placeholder="https://www.linkedin.com/in/username" onChange={(event) => setCareerInput({ ...careerInput, linkedIn: event.target.value })} />}
              </FormField>
              <FormField id="career-portfolio" label="Portfolio URL (optional)">
                {(control) => <Input {...control} type="url" value={careerInput.portfolio} placeholder="https://your-portfolio.example" onChange={(event) => setCareerInput({ ...careerInput, portfolio: event.target.value })} />}
              </FormField>
            </div>
            {careerError && <FormAlert>{careerError}</FormAlert>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={update.isPending}><Check className="h-3.5 w-3.5" /> Save</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setIsEditingCareer(false)}><X className="h-3.5 w-3.5" /> Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <CareerLink label="GitHub" href={profileData.careerLinks.github} />
            <CareerLink label="LinkedIn" href={profileData.careerLinks.linkedIn} />
            <CareerLink label="Portfolio" href={profileData.careerLinks.portfolio} />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="CV / resume"
        description="Private document storage is not available in this application."
        icon={<FileText className="h-4 w-4" />}
      >
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Secure resume upload is not configured</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              The current LMS has no protected document-storage service or ownership-checked upload API. Upload and download controls are withheld until that integration is available.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Additional certificates"
        description="Add credentials earned outside this LMS. These are not official LMS-issued certificates."
        icon={<FileBadge className="h-4 w-4" />}
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCertificateError('')
              setIsAddingCertificate(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add certificate
          </Button>
        }
      >
        {profileData.externalCertificates.length ? (
          <div className="space-y-3">
            {profileData.externalCertificates.map((certificate) => (
              <div key={certificate.id} className="flex flex-col gap-3 rounded-lg border border-border/70 p-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{certificate.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {certificate.issuer}
                    {certificate.issueDate ? ` · Issued ${certificate.issueDate}` : ''}
                  </p>
                  {certificate.credentialUrl && (
                    <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      Verify credential <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCertificateToEdit(certificate)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" aria-label={`Remove ${certificate.title}`} onClick={() => confirmDeleteCertificate(certificate)}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileBadge} title="No additional certificates" description="Add an external certificate when you are ready. This is optional." size="sm" />
        )}
      </SectionCard>

      <CertificateEditor
        key={certificateToEdit?.id ?? (isAddingCertificate ? 'new-certificate' : 'closed')}
        open={isAddingCertificate || certificateToEdit !== null}
        certificate={certificateToEdit}
        error={certificateError}
        isSaving={addCertificate.isPending || updateCertificate.isPending}
        onClose={closeCertificateDialog}
        onSave={saveCertificate}
      />
    </div>
  )
}

function OfficialInformationNotice() {
  return (
    <div className="mt-4 rounded-md border border-border/70 bg-muted/20 p-3">
      <p className="text-xs font-semibold text-foreground">Need to update your official information?</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Please contact the system team by email or meet the team in person. Only authorized system-team members can update official student records.
      </p>
    </div>
  )
}

function CareerLink({ label, href }: { label: string; href: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline">
          {href} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">Not added</p>
      )}
    </div>
  )
}

interface CertificateFormValues {
  title: string
  issuer: string
  issueDate: string
  credentialUrl: string
}

function CertificateEditor({
  open,
  certificate,
  error,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean
  certificate: ExternalStudentCertificate | null
  error: string
  isSaving: boolean
  onClose: () => void
  onSave: (values: CertificateFormValues) => void
}) {
  const [values, setValues] = useState<CertificateFormValues>({
    title: certificate?.title ?? '',
    issuer: certificate?.issuer ?? '',
    issueDate: certificate?.issueDate ?? '',
    credentialUrl: certificate?.credentialUrl ?? '',
  })
  const [validationError, setValidationError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.title.trim() || !values.issuer.trim()) {
      setValidationError('Certificate title and issuing organization are required.')
      return
    }
    if (values.credentialUrl.trim()) {
      try {
        const url = new URL(values.credentialUrl.trim())
        if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
      } catch {
        setValidationError('Enter a valid HTTP or HTTPS credential URL.')
        return
      }
    }
    setValidationError('')
    onSave(values)
  }

  return (
    <Modal open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>{certificate ? 'Edit additional certificate' : 'Add additional certificate'}</ModalTitle>
          <ModalDescription>
            This record is separate from certificates issued through LeadFlow LMS.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={submit}>
          <ModalBody className="space-y-4">
            <FormField id="external-certificate-title" label="Certificate title" required>
              {(control) => <Input {...control} required maxLength={160} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} />}
            </FormField>
            <FormField id="external-certificate-issuer" label="Issuing organization" required>
              {(control) => <Input {...control} required maxLength={160} value={values.issuer} onChange={(event) => setValues({ ...values, issuer: event.target.value })} />}
            </FormField>
            <FormField id="external-certificate-date" label="Issue date (optional)">
              {(control) => <Input {...control} type="date" value={values.issueDate} onChange={(event) => setValues({ ...values, issueDate: event.target.value })} />}
            </FormField>
            <FormField id="external-certificate-url" label="Credential URL (optional)">
              {(control) => <Input {...control} type="url" placeholder="https://" value={values.credentialUrl} onChange={(event) => setValues({ ...values, credentialUrl: event.target.value })} />}
            </FormField>
            {validationError && <p role="alert" className="text-xs text-destructive">{validationError}</p>}
            {error && <FormAlert>{error}</FormAlert>}
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSaving}>{certificate ? 'Save changes' : 'Add certificate'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export function StudentProfilePage() {
  const { role } = usePermission()
  if (role !== 'student') return <NoAccess />
  return <StudentProfileContent />
}

export default StudentProfilePage
