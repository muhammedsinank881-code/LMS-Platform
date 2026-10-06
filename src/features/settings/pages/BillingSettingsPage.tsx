import { NoAccess } from '@/components/common/NoAccess'
import { QueryState } from '@/components/common/QueryState'
import { queryBlocked } from '@/components/common/query-blocked'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { formatINR } from '@/lib/format/currency'
import { SectionIntro } from '../components/SettingsLayout'
import { useBilling } from '../hooks/use-settings'

const PLANS = [
  { id: 'free', name: 'Free', price: formatINR(0) },
  { id: 'pro', name: 'Pro', price: `${formatINR(4999)} / month` },
  { id: 'enterprise', name: 'Business', price: 'Talk to us' },
] as const

export function BillingSettingsPage() {
  const { canSection } = usePermission()
  const billing = useBilling()
  if (!canSection('billing')) return <NoAccess />
  const blocked = queryBlocked(billing)
  if (blocked || !billing.data) return blocked ?? <QueryState isLoading={false} isError onRetry={() => void billing.refetch()} />
  const { plan, usage, limits, invoices } = billing.data
  return (
    <div className="space-y-6">
      <SectionIntro title="Billing & plan" description="A preview of plans and usage. Payments are not connected." />
      <div className="grid gap-3 md:grid-cols-3">
        {PLANS.map((item) => (
          <Card key={item.id} className={item.id === plan ? 'border-primary' : undefined}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                {item.name}
                {item.id === plan ? <Badge tone="primary">Current</Badge> : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.price}</p>
              <Button variant="outline" disabled={item.id === plan} onClick={() => toast.info('Upgrade is coming soon')}>Upgrade</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <section className="space-y-2 text-sm">
        <Meter label="Users" used={usage.users} limit={limits.users} />
        <Meter label="Leads" used={usage.leads} limit={limits.leads} />
        <Meter label="Storage (MB)" used={usage.storageMb} limit={limits.storageMb} />
      </section>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="py-2">Invoice</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-border">
              <td className="py-2">{invoice.id}</td>
              <td>{invoice.issuedAt.slice(0, 10)}</td>
              <td>{formatINR(invoice.amount)}</td>
              <td>Paid</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const width = Math.min(100, Math.round((used / limit) * 100))
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span>{label}</span>
        <span className="text-muted-foreground">{used} / {limit}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
