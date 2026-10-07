import { PageHeader } from '@/components/layout/PageHeader'

export function MyStudentsHeader() {
  return (
    <PageHeader
      title="Students"
      description="View and manage students assigned to you"
      breadcrumbs={[
        { label: 'Dashboard', to: '/mentor/dashboard' },
        { label: 'Students' },
      ]}
    />
  )
}
