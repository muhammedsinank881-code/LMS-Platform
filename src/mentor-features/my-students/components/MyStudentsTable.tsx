import type { AssignedStudent } from '../types'
import { MyStudentCard } from './MyStudentCard'
import { MyStudentRow } from './MyStudentRow'

interface MyStudentsTableProps {
  students: AssignedStudent[]
  onSelectStudent: (student: AssignedStudent) => void
}

export function MyStudentsTable({
  students,
  onSelectStudent,
}: MyStudentsTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:block bg-surface border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {students.map((student) => (
                <MyStudentRow
                  key={student.id}
                  student={student}
                  onSelectStudent={onSelectStudent}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden space-y-3">
        {students.map((student) => (
          <MyStudentCard
            key={student.id}
            student={student}
            onSelectStudent={onSelectStudent}
          />
        ))}
      </div>
    </>
  )
}

