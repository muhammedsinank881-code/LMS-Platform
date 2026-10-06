import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui'

interface SectionProps {
  id: string
  title: string
  description?: string
  children: ReactNode
}

export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 space-y-3">
      <div>
        <h2 id={`${id}-title`} className="text-lg font-semibold">
          {title}
        </h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <Card>
        <CardContent className="space-y-6 p-6">{children}</CardContent>
      </Card>
    </section>
  )
}

interface SpecimenProps {
  label: string
  children: ReactNode
  className?: string
}

/** A labelled row of component examples. */
export function Specimen({ label, children, className }: SpecimenProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={className ?? 'flex flex-wrap items-center gap-3'}>{children}</div>
    </div>
  )
}
