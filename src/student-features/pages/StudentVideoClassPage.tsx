import { useState } from 'react'
import { ArrowLeft, Clock, PlayCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { MOCK_STUDENT_DATA, type PendingClass } from '../mock/student-data'

export function StudentVideoClassPage() {
  const [searchParams] = useSearchParams()
  const classId = searchParams.get('id') || MOCK_STUDENT_DATA.pendingClasses[0].id

  const currentClass =
    MOCK_STUDENT_DATA.pendingClasses.find((c) => c.id === classId) ||
    MOCK_STUDENT_DATA.pendingClasses[0]

  const [selectedClass, setSelectedClass] = useState<PendingClass>(currentClass)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <span>•</span>
        <Link
          to="/student/dashboard"
          className="transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
      </div>

      <PageHeader
        title={selectedClass.title}
        description={`${selectedClass.module} • Duration: ${selectedClass.duration}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Video Player & Lesson Area */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-video w-full bg-black">
              <video
                key={selectedClass.id}
                controls
                autoPlay
                poster={selectedClass.thumbnail}
                className="h-full w-full object-contain"
              >
                <track
                  kind="captions"
                  src={selectedClass.videoUrl}
                  srcLang="en"
                  label="English"
                />
                <source src={selectedClass.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="rounded bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary">
                  {selectedClass.module}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {selectedClass.duration}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground">{selectedClass.title}</h2>
              <p className="text-xs text-muted-foreground">
                In this video session, we dive into practical hands-on examples, state management
                patterns, and interactive component building for full-stack applications.
              </p>
            </div>
          </Card>

          {/* Lesson Discussion / Notes */}
          <Tabs defaultValue="notes" className="w-full">
            <TabsList>
              <TabsTrigger value="notes">Class Notes</TabsTrigger>
              <TabsTrigger value="discussion">Discussion (4)</TabsTrigger>
            </TabsList>
            <TabsContent value="notes">
              <Card className="space-y-2 p-4 text-xs">
                <h4 className="font-semibold text-foreground">Summary & Code Snippets</h4>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Review key state hooks and Zustand persistence.</li>
                  <li>Recharts responsive container configuration.</li>
                  <li>Role-based access control inside sidebar components.</li>
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="discussion">
              <Card className="space-y-3 p-4 text-xs">
                <div className="border-b border-border pb-2">
                  <p className="font-semibold text-foreground">Rahul Verma</p>
                  <p className="text-muted-foreground">
                    Great lecture! The explanation of Recharts tooltips was super helpful.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Mentor Hasna PK</p>
                  <p className="text-muted-foreground">
                    Thanks Rahul! Check out the assignment lab for hands-on practice.
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Video Class Playlist / Queue */}
        <div>
          <Card className="space-y-3 p-4">
            <h3 className="text-sm font-semibold text-foreground">Course Video Modules</h3>
            <div className="space-y-2">
              {MOCK_STUDENT_DATA.pendingClasses.map((cls) => {
                const isActive = cls.id === selectedClass.id
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-all ${
                      isActive
                        ? 'border-primary bg-primary-subtle/50 font-semibold'
                        : 'bg-surface-hover border-border/60 hover:border-primary/50'
                    }`}
                  >
                    <PlayCircle
                      className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs ${isActive ? 'text-primary' : 'text-foreground'}`}
                      >
                        {cls.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{cls.duration}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
