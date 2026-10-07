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
      <div className="hidden sm:block bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-slate-900/60 border-b border-[#E2E8F0] dark:border-border text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                <th className="py-3 px-4">STUDENT</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">CLASS</th>
                <th className="py-3 px-4">EMAIL</th>
                <th className="py-3 px-4">ATTENDANCE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
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
