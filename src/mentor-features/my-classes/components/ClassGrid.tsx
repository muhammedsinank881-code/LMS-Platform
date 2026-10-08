import type { MentorClass } from '../types'
import { ClassCard } from './ClassCard'

interface ClassGridProps {
  classes: MentorClass[]
}

export function ClassGrid({ classes }: ClassGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {classes.map((cls) => (
        <ClassCard key={cls.id} cls={cls} />
      ))}
    </div>
  )
}
