import { useState } from 'react'
import { Pagination, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Section, Specimen } from './Section'

const TAB_ITEMS = [
  { value: 'overview', label: 'Overview' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'followups', label: 'Follow-ups & Tasks' },
  { value: 'conversations', label: 'Conversations' },
  { value: 'deal', label: 'Deal' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'audit', label: 'Audit', disabled: true },
]

export function TabsSection() {
  return (
    <Section
      id="tabs"
      title="Tabs"
      description="Left/Right arrows move between tabs, Home/End jump. The list scrolls horizontally on small screens."
    >
      {(['underline', 'pill'] as const).map((variant) => (
        <Specimen key={variant} label={variant} className="block">
          <Tabs defaultValue="overview" variant={variant}>
            <TabsList aria-label={`${variant} tabs`}>
              {TAB_ITEMS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TAB_ITEMS.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="text-sm text-muted-foreground"
              >
                {tab.label} panel content.
              </TabsContent>
            ))}
          </Tabs>
        </Specimen>
      ))}
    </Section>
  )
}

export function PaginationSection() {
  const [page, setPage] = useState(5)
  const [pageSize, setPageSize] = useState(10)
  const [shortPage, setShortPage] = useState(1)

  return (
    <Section
      id="pagination"
      title="Pagination"
      description="Page numbers with ellipses on desktop; compact 'Page x of y' on mobile."
    >
      <Specimen label="With page-size selector (237 items)" className="block">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={237}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </Specimen>
      <Specimen label="Few pages, no selector (24 items)" className="block">
        <Pagination page={shortPage} pageSize={10} total={24} onPageChange={setShortPage} />
      </Specimen>
      <Specimen label="Empty" className="block">
        <Pagination page={1} pageSize={10} total={0} onPageChange={() => {}} />
      </Specimen>
    </Section>
  )
}
