import { useState } from 'react'
import { Inbox, TriangleAlert } from 'lucide-react'
import { Button, Card, EmptyState, ProgressBar, Skeleton, toast } from '@/components/ui'
import { Section, Specimen } from './Section'

export function SkeletonSection() {
  return (
    <Section
      id="skeleton"
      title="Skeleton"
      description="Decorative placeholders for loading states."
    >
      <Specimen label="Shapes">
        <Skeleton className="h-10 w-32" />
        <Skeleton shape="circle" className="h-10 w-10" />
        <Skeleton shape="text" className="w-48" />
      </Specimen>
      <Specimen label="List row composition" className="space-y-3">
        <div role="status" aria-busy="true" aria-label="Loading leads" className="space-y-3">
          {[0, 1, 2].map((row) => (
            <Card key={row} className="flex items-center gap-3 p-4">
              <Skeleton shape="circle" className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton shape="text" className="w-1/3" />
                <Skeleton shape="text" className="w-2/3" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </Card>
          ))}
        </div>
      </Specimen>
    </Section>
  )
}

export function ProgressSection() {
  return (
    <Section
      id="progress"
      title="ProgressBar"
      description="Sizes, tones, label, value and indeterminate."
    >
      <Specimen label="Sizes" className="grid gap-4 sm:grid-cols-3">
        <ProgressBar aria-label="Small" size="sm" value={30} />
        <ProgressBar aria-label="Medium" size="md" value={55} />
        <ProgressBar aria-label="Large" size="lg" value={80} />
      </Specimen>
      <Specimen label="Tones with label" className="grid gap-4 sm:grid-cols-2">
        <ProgressBar label="Import progress" showValue value={64} />
        <ProgressBar label="Quota used" showValue tone="warning" value={82} />
        <ProgressBar label="Target reached" showValue tone="success" value={100} />
        <ProgressBar label="Overdue share" showValue tone="destructive" value={12} />
      </Specimen>
      <Specimen label="Indeterminate" className="grid gap-4 sm:grid-cols-2">
        <ProgressBar label="Validating file…" value={null} />
      </Specimen>
    </Section>
  )
}

export function EmptyStateSection() {
  return (
    <Section id="empty-state" title="EmptyState" description="Used for empty and error states.">
      <Specimen label="Empty with action" className="grid gap-4 md:grid-cols-2">
        <Card>
          <EmptyState
            icon={Inbox}
            title="No leads yet"
            description="Leads you capture or import will show up here."
            action={<Button>Add lead</Button>}
          />
        </Card>
        <Card>
          <EmptyState
            tone="destructive"
            icon={TriangleAlert}
            title="Couldn't load leads"
            description="Something went wrong on our side. Try again."
            action={<Button variant="outline">Retry</Button>}
          />
        </Card>
      </Specimen>
      <Specimen label="Small, no icon">
        <Card className="w-full">
          <EmptyState size="sm" title="Nothing to show" description="Adjust your filters." />
        </Card>
      </Specimen>
    </Section>
  )
}

export function ToastSection() {
  const [count, setCount] = useState(0)

  return (
    <Section
      id="toast"
      title="Toast"
      description="Imperative API. Swipe right or press the close button to dismiss. F8 jumps focus to the viewport."
    >
      <Specimen label="Variants">
        <Button variant="outline" onClick={() => toast({ title: 'Default notification' })}>
          Default
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success('Lead saved', { description: 'L-10231 was updated.' })}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error('Could not save lead', { description: 'Check your connection and retry.' })
          }
        >
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.warning('Possible duplicate found')}>
          Warning
        </Button>
        <Button variant="outline" onClick={() => toast.info('Import started')}>
          Info
        </Button>
      </Specimen>
      <Specimen label="With action">
        <Button
          variant="outline"
          onClick={() =>
            toast.success('Lead deleted', {
              duration: 8000,
              action: { label: 'Undo', onClick: () => setCount((c) => c + 1) },
            })
          }
        >
          Delete with undo
        </Button>
        <span className="text-sm text-muted-foreground">Undo clicked {count} times</span>
      </Specimen>
    </Section>
  )
}
