import { lazy, Suspense, useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import { FilterSheet } from '@/components/common/FilterSheet'
import { FilterBuilder, toListFilters, type FilterDraft, type FilterFieldConfig } from '@/components/common/filter-builder'
import { FilterChips } from '@/components/common/FilterChips'
import { SearchInput } from '@/components/common/SearchInput'
import { Button, EmptyState, Select, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useLeadLookups } from '@/features/leads/hooks/use-lead-lookups'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import { PRIORITIES, SCORE_CATEGORIES } from '@/types'
import { BoardSummary } from '../components/BoardSummary'
const PipelineBoard = lazy(() => import('../components/PipelineBoard').then((mod) => ({ default: mod.PipelineBoard })))
import { useBoardUrl, type BoardFilter } from '../hooks/use-board-url'
import { useBoardSummary } from '../hooks/use-stage-column'

function fields(lookups: ReturnType<typeof useLeadLookups>['lookups']): FilterFieldConfig<BoardFilter>[] {
  return [
    { id: 'ownerId', label: 'Owner', type: 'user', options: lookups.users.map((user) => ({ value: user.id, label: user.name })) },
    { id: 'sourceId', label: 'Source', type: 'select', options: lookups.sources.map((source) => ({ value: source.id, label: source.name })) },
    { id: 'priority', label: 'Priority', type: 'select', options: PRIORITIES.map((value) => ({ value, label: value })) },
    { id: 'scoreCategory', label: 'Score', type: 'select', options: SCORE_CATEGORIES.map((value) => ({ value, label: value })) },
    { id: 'tags', label: 'Tags', type: 'multi-select', options: lookups.tags.map((tag) => ({ value: tag.name, label: tag.name })) },
    { id: 'value', label: 'Value', type: 'currency' },
  ]
}

export function PipelinePage() {
  const url = useBoardUrl()
  const pipelines = usePipelines()
  const { lookups, lostReasons } = useLeadLookups()
  const list = pipelines.data ?? []
  const selected = list.find((pipeline) => pipeline.id === url.pipelineId) ?? list.find((pipeline) => pipeline.isDefault) ?? list[0]
  const summary = useBoardSummary(url.board, selected?.id ?? '', url.search, url.filters)
  const filterFields = fields(lookups)
  const [draft, setDraft] = useState<FilterDraft<BoardFilter>[]>(url.filters)
  const [open, setOpen] = useState(false)
  const now = useMemo(() => new Date(), [])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-1 text-lg font-semibold tracking-tight text-foreground">Pipeline</h1>
        <Tabs value={url.board} onValueChange={(value) => url.setBoard(value === 'deals' ? 'deals' : 'leads')} variant="pill">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
          </TabsList>
          <TabsContent value="leads" forceMount className="sr-only">Lead pipeline</TabsContent>
          <TabsContent value="deals" forceMount className="sr-only">Deal pipeline</TabsContent>
        </Tabs>
        {selected ? (
          <Select
            aria-label="Pipeline"
            size="sm"
            className="w-40"
            value={selected.id}
            onValueChange={url.setPipelineId}
            options={list.map((item) => ({ value: item.id, label: item.name }))}
          />
        ) : null}
        <div className="w-full min-w-0 sm:w-44">
          <SearchInput defaultValue={url.search} onValueChange={url.setSearch} placeholder="Search the board" aria-label="Search the board" />
        </div>
        <FilterSheet
          open={open}
          onOpenChange={setOpen}
          trigger={<Button type="button" variant="outline" size="sm"><Filter /> Filters</Button>}
        >
          <FilterBuilder
            fields={filterFields}
            value={draft}
            onChange={setDraft}
            onApply={() => {
              url.setFilters(toListFilters(filterFields, draft))
              setOpen(false)
            }}
            onClear={() => {
              setDraft([])
              url.setFilters([])
            }}
          />
        </FilterSheet>
        {selected ? (
          <div className="sm:ml-auto sm:shrink-0">
            <BoardSummary compact summary={summary.data} loading={summary.isLoading} />
          </div>
        ) : null}
      </div>
      <FilterChips
          fields={filterFields}
          filters={url.filters}
          onRemove={(index) => url.setFilters(url.filters.filter((_, item) => item !== index))}
          onClear={() => url.setFilters([])}
        />
      {pipelines.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      {pipelines.isError ? (
        <EmptyState tone="destructive" title="Couldn't load pipelines" action={<Button variant="outline" onClick={() => void pipelines.refetch()}>Retry</Button>} />
      ) : null}
      {!pipelines.isLoading && !selected ? <EmptyState title="No pipelines yet" /> : null}
      {selected ? (
        <Suspense fallback={<Skeleton className="h-64 w-full" aria-label="Loading board" />}>
          <PipelineBoard
            board={url.board}
            pipeline={selected}
            search={url.search}
            filters={url.filters}
            sources={lookups.sources}
            users={lookups.users}
            reasons={lostReasons}
            now={now}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
