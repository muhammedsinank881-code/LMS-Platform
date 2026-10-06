import { SearchInput } from '@/components/common/SearchInput'
import { Button, DateRangePicker, Select } from '@/components/ui'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { CAMPAIGN_STATUS_LABELS, PLATFORM_LABELS } from '@/lib/campaign-labels'
import { useDirectory } from '@/features/team/hooks/use-team'
import { CAMPAIGN_PLATFORMS, CAMPAIGN_STATUSES } from '@/types'
import { SAVED_VIEWS, SAVED_VIEW_LABELS, type CampaignListUrl } from '../../lib/list-url'

const ALL = 'all'

export function CampaignFiltersBar({ url, range }: { url: CampaignListUrl; range: DateRangeState }) {
  const directory = useDirectory()
  return (
    <div className="space-y-3">
      <div role="group" aria-label="Saved views" className="flex flex-wrap items-center gap-2">
        {SAVED_VIEWS.map((view) => (
          <Button
            key={view}
            size="sm"
            variant={url.view === view ? 'secondary' : 'outline'}
            aria-pressed={url.view === view}
            onClick={() => url.setView(url.view === view ? null : view)}
          >
            {SAVED_VIEW_LABELS[view]}
          </Button>
        ))}
        {url.hasFilters ? (
          <Button size="sm" variant="ghost" onClick={url.clear}>
            Clear filters
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          className="w-full sm:w-64"
          placeholder="Search campaigns"
          aria-label="Search campaigns"
          defaultValue={url.search}
          onValueChange={url.setSearch}
        />
        <Select
          className="w-[calc(50%-0.25rem)] sm:w-40"
          aria-label="Platform"
          value={url.platform ?? ALL}
          onValueChange={(value) => url.setPlatform(value === ALL ? null : value)}
          options={[
            { value: ALL, label: 'All platforms' },
            ...CAMPAIGN_PLATFORMS.map((value) => ({ value, label: PLATFORM_LABELS[value] })),
          ]}
        />
        <Select
          className="w-[calc(50%-0.25rem)] sm:w-36"
          aria-label="Status"
          value={url.status ?? ALL}
          onValueChange={(value) => url.setStatus(value === ALL ? null : value)}
          options={[
            { value: ALL, label: 'All statuses' },
            ...CAMPAIGN_STATUSES.map((value) => ({ value, label: CAMPAIGN_STATUS_LABELS[value] })),
          ]}
        />
        <Select
          className="w-[calc(50%-0.25rem)] sm:w-40"
          aria-label="Owner"
          value={url.owner ?? ALL}
          onValueChange={(value) => url.setOwner(value === ALL ? null : value)}
          options={[
            { value: ALL, label: 'All owners' },
            ...(directory.data ?? []).map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
        <DateRangePicker
          preset={range.preset}
          fromDay={range.fromDay}
          toDay={range.toDay}
          compare={range.compare}
          onPreset={range.setPreset}
          onCustom={range.setCustom}
          onCompare={range.setCompare}
        />
      </div>
    </div>
  )
}
