import { PageHeader } from '@/components/layout/PageHeader'
import { CertificateHero } from '../components/CertificateHero'
import { CertificateProgressBar } from '../components/CertificateProgressBar'
import { RequirementsChecklist } from '../components/RequirementsChecklist'
import { CertificateCard } from '../components/CertificateCard'
import { useCertificate } from '../hooks/useCertificate'

export function CertificatePage() {
  const {
    cert,
    completedCourses,
    completedAssignments,
    completedProjects,
    isFinalAssessmentUnlocked,
    isEarned,
  } = useCertificate()

  return (
    <div className="space-y-4 pb-12">
      {/* Page Header */}
      <PageHeader
        title="My Certificate"
        description="Track your progress toward earning your course completion certificate. Complete all requirements to unlock and download."
      />

      {/* Hero Status Banner */}
      <CertificateHero
        status={cert.status}
        overallProgress={cert.overallProgress}
        title={cert.title}
        courseName={cert.courseName}
        studentName={cert.studentName}
      />

      {/* Overall Progress Widget */}
      <CertificateProgressBar
        overallProgress={cert.overallProgress}
        completedCourses={completedCourses}
        totalCourses={cert.courseRequirements.length}
        completedAssignments={completedAssignments}
        totalAssignments={cert.assignmentRequirements.length}
        completedProjects={completedProjects}
        totalProjects={cert.projectRequirements.length}
      />

      {/* Two Column on large screens: Requirements (left) + Certificate Card (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Left: Full requirements checklist — 3 of 5 cols */}
        <div className="lg:col-span-3">
          <RequirementsChecklist
            cert={cert}
            isFinalAssessmentUnlocked={isFinalAssessmentUnlocked}
          />
        </div>

        {/* Right: Certificate preview card — 2 of 5 cols, sticky on desktop */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-0">
            <CertificateCard cert={cert} isEarned={isEarned} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificatePage
