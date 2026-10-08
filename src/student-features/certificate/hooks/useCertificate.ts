import { useMemo } from 'react'
import { MOCK_CERTIFICATE_DATA } from '../data/certificateData'

export function useCertificate() {
  const cert = MOCK_CERTIFICATE_DATA

  const completedCourses = useMemo(
    () => cert.courseRequirements.filter((r) => r.status === 'completed').length,
    [cert.courseRequirements],
  )

  const completedAssignments = useMemo(
    () => cert.assignmentRequirements.filter((r) => r.status === 'completed').length,
    [cert.assignmentRequirements],
  )

  const completedProjects = useMemo(
    () => cert.projectRequirements.filter((r) => r.status === 'completed').length,
    [cert.projectRequirements],
  )

  const isFinalAssessmentUnlocked =
    completedCourses === cert.courseRequirements.length &&
    completedAssignments === cert.assignmentRequirements.length &&
    completedProjects === cert.projectRequirements.length

  const isEarned = cert.status === 'earned'

  return {
    cert,
    completedCourses,
    completedAssignments,
    completedProjects,
    isFinalAssessmentUnlocked,
    isEarned,
  }
}
