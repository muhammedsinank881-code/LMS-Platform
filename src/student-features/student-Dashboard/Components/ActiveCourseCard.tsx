import { useState } from 'react'
import { BookOpen, ChevronRight, FileText, Radio } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Modal, ModalBody, ModalContent, ModalDescription, ModalHeader, ModalTitle, ProgressBar } from '@/components/ui'
import { MOCK_STUDENT_DATA } from '../../mock/student-data'

export function ActiveCourseCard() {
  const navigate = useNavigate()
  const [notesOpen, setNotesOpen] = useState(false)
  const { activeCourse } = MOCK_STUDENT_DATA

  const handleCardClick = () => {
    navigate('/student/courses')
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative cursor-pointer rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/50 hover:shadow-md"
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary">
                {activeCourse.code}
              </span>
              <span className="text-xs text-muted-foreground">Active Enrolled Course</span>
            </div>
            <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {activeCourse.title}
            </h3>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotesOpen(true)}
              className="gap-1.5 text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              Syllabus Notes
            </Button>

            <Button
              size="sm"
              disabled={!activeCourse.isLiveClassActive}
              className={`gap-1.5 text-xs ${activeCourse.isLiveClassActive
                  ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                  : 'opacity-50 cursor-not-allowed'
                }`}
            >
              <Radio className="h-3.5 w-3.5" />
              {activeCourse.isLiveClassActive ? 'Join Live Class' : 'No Live Class'}
            </Button>
          </div>
        </div>

        {/* Progress & Next Lesson */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg bg-surface-hover p-3.5 border border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Course Completion</span>
              <span className="font-semibold text-foreground">{activeCourse.progress}%</span>
            </div>
            <ProgressBar value={activeCourse.progress} size="md" />
            <p className="text-[11px] text-muted-foreground">
              {activeCourse.completedModules} of {activeCourse.totalModules} modules completed
            </p>
          </div>

          <div className="space-y-1.5 rounded-lg bg-surface-hover p-3.5 border border-border/50">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Up Next to Learn
            </span>
            <p className="text-xs font-semibold text-foreground truncate">{activeCourse.nextLesson}</p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
              <BookOpen className="h-3 w-3 text-primary" />
              <span>Module {activeCourse.completedModules + 1}</span>
            </div>
          </div>
        </div>

        {/* Mentor Info Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <Avatar name={activeCourse.mentorName} src={activeCourse.mentorAvatar} size="xs" />
            <span className="text-muted-foreground">Assigned Mentor:</span>
            <span className="font-semibold text-foreground">{activeCourse.mentorName}</span>
          </div>

          <span className="flex items-center gap-1 font-medium text-primary text-xs group-hover:translate-x-1 transition-transform">
            View Full Course Details <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Syllabus Notes Modal */}
      <Modal open={notesOpen} onOpenChange={setNotesOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Syllabus & Course Notes</ModalTitle>
            <ModalDescription>
              Key learning modules for {activeCourse.title}
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-3 py-2 text-xs">
            {activeCourse.syllabusNotes.map((note, index) => (
              <div key={index} className="flex items-start gap-2 rounded-md bg-muted p-2.5">
                <span className="font-semibold text-primary">{index + 1}.</span>
                <span className="text-foreground">{note}</span>
              </div>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
