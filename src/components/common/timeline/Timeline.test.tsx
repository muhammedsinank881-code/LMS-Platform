import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render'
import type { Activity, LeadId } from '@/types'
import { activityTypesForFilter, Timeline, type ActivityChipId, type TimelineLookups } from './index'

const lookups: TimelineLookups = {
  status: (id) => ({ name: id === 'from' ? 'New' : 'Qualified', color: '#111111' }),
  userName: (id) => (id ? `User ${id}` : 'System'),
  sourceName: () => 'Facebook',
}

const dayA = '2026-10-01T08:00:00.000Z'
const dayB = '2026-10-02T08:00:00.000Z'

function event<T extends Activity['type']>(
  id: string,
  createdAt: string,
  payload: Pick<Extract<Activity, { type: T }>, 'type' | 'data'>,
): Activity {
  return {
    id,
    tenantId: 't',
    leadId: 'L-1' as LeadId,
    actorId: 'u1',
    createdAt,
    dealId: null,
    ...payload,
  } as Activity
}

const items: Activity[] = [
  event('a1', dayA, { type: 'lead_created', data: { sourceId: 'src' } }),
  event('a2', dayA, { type: 'assigned', data: { toUserId: 'u2', ruleId: null } }),
  event('a3', dayA, { type: 'reassigned', data: { fromUserId: 'u1', toUserId: 'u2' } }),
  event('a4', dayA, { type: 'status_changed', data: { fromStatusId: 'from', toStatusId: 'to', lostReasonId: null } }),
  event('a5', dayA, { type: 'note', data: { text: 'Call them back' } }),
  event('a6', dayA, { type: 'call', data: { durationSecs: 125, outcome: 'connected', notes: 'Spoke to the buyer' } }),
  event('a7', dayA, { type: 'whatsapp_sent', data: { body: 'Hello on WhatsApp' } }),
  event('a8', dayA, { type: 'whatsapp_received', data: { body: 'Reply on WhatsApp' } }),
  event('a9', dayA, { type: 'email_sent', data: { subject: 'Proposal attached', body: 'See the quote' } }),
  event('a10', dayB, { type: 'email_received', data: { subject: 'Re: Proposal', body: 'Looks good' } }),
  event('a11', dayB, { type: 'followup_scheduled', data: { followUpId: 'fu', kind: 'call', dueAt: dayB } }),
  event('a12', dayB, { type: 'followup_completed', data: { followUpId: 'fu', kind: 'call', note: 'Done' } }),
  event('a13', dayB, { type: 'meeting', data: { title: 'Discovery meeting', startsAt: dayB, notes: 'Room 2', attendees: 'Asha' } }),
  event('a14', dayB, { type: 'demo', data: { title: 'Product demo', startsAt: dayB, notes: 'Dashboard' } }),
  event('a15', dayB, { type: 'quotation_sent', data: { amount: 150000, reference: 'QT-15' } }),
  event('a16', dayB, { type: 'score_changed', data: { from: 10, to: 40 } }),
  event('a17', dayB, { type: 'merged', data: { secondaryLeadId: 'L-99' as LeadId } }),
  event('a18', dayB, { type: 'converted', data: { customerId: 'C-3' } }),
]

function Harness({ source }: { source: Activity[] }) {
  const [chip, setChip] = useState<ActivityChipId | null>(null)
  const [showSystem, setShowSystem] = useState(true)
  const types = activityTypesForFilter(chip, showSystem)
  const visible = types ? source.filter((item) => types.includes(item.type)) : source
  return (
    <Timeline
      items={visible}
      lookups={lookups}
      chip={chip}
      showSystem={showSystem}
      onChipChange={setChip}
      onShowSystemChange={setShowSystem}
    />
  )
}

describe('Timeline', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders every activity type and groups events by day', () => {
    renderWithProviders(<Harness source={items} />)
    expect(screen.getByText('Call them back')).toBeInTheDocument()
    expect(screen.getByText(/Connected/)).toBeInTheDocument()
    expect(screen.getByText(/2 min/)).toBeInTheDocument()
    expect(screen.getByText('Hello on WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Reply on WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Proposal attached')).toBeInTheDocument()
    expect(screen.getByText('Re: Proposal')).toBeInTheDocument()
    expect(screen.getByText('Discovery meeting')).toBeInTheDocument()
    expect(screen.getByText(/Attendees: Asha/)).toBeInTheDocument()
    expect(screen.getByText('Product demo')).toBeInTheDocument()
    expect(screen.getByText(/QT-15/)).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Qualified')).toBeInTheDocument()
    expect(screen.getByText(/Facebook/)).toBeInTheDocument()
    expect(screen.getByText(/Manual/)).toBeInTheDocument()
    expect(screen.getAllByText(/User u1/).length).toBeGreaterThan(0)
    expect(screen.getByText('10 → 40')).toBeInTheDocument()
    expect(screen.getByText(/Merged L-99/)).toBeInTheDocument()
    expect(screen.getByText(/Customer C-3/)).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  })

  it('filters by chip and hides system events', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness source={items} />)
    const filters = screen.getByRole('toolbar', { name: 'Filter activity' })
    await user.click(within(filters).getByRole('button', { name: 'Notes' }))
    expect(screen.getByText('Call them back')).toBeInTheDocument()
    expect(screen.queryByText(/Connected/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Facebook/)).not.toBeInTheDocument()

    await user.click(within(filters).getByRole('button', { name: 'Notes' }))
    expect(screen.getByText(/Facebook/)).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Show system events' }))
    expect(screen.queryByText(/Facebook/)).not.toBeInTheDocument()
    expect(screen.getByText('Call them back')).toBeInTheDocument()
  })
})
