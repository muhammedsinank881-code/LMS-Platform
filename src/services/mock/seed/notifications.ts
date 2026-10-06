import type { Conversation, Notification, NotificationType } from '@/types'
import type { SeedContext, SeedSales, SeedWork } from './context'
import { HOUR, MINUTE, chance, int, pick, sample, seedId, type SeedEnv } from './rng'

type Draft = Omit<Notification, 'id' | 'tenantId' | 'readAt'> & { read: boolean }

/** A few private notifications per user, drawn from the data they actually own. */
export function buildNotifications(
  env: SeedEnv,
  ctx: SeedContext,
  sales: SeedSales,
  work: SeedWork,
  conversations: readonly Conversation[],
): Notification[] {
  const now = env.now.getTime()
  const ago = (minutes: number) => new Date(now - minutes * MINUTE).toISOString()
  const drafts: Draft[] = []
  const leadName = (id: string) => ctx.leads.find((l) => l.id === id)?.name ?? id

  const add = (
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    link: string,
    minutesAgo: number,
  ) =>
    drafts.push({
      userId,
      type,
      title,
      body,
      link,
      createdAt: ago(minutesAgo),
      read: chance(env, 0.45),
    })

  for (const user of ctx.users) {
    const mine = ctx.leads.filter((l) => l.assignedTo === user.id && !l.archivedAt)
    for (const lead of sample(env, mine, 2)) {
      add(
        user.id,
        'lead_assigned',
        'New lead assigned',
        `${lead.name} was assigned to you.`,
        `/leads/${lead.id}`,
        int(env, 5, 3000),
      )
    }
    for (const f of work.followUps
      .filter((x) => x.assigneeId === user.id && x.status === 'pending')
      .slice(0, 2)) {
      const overdue = Date.parse(f.dueAt) < now
      add(
        user.id,
        overdue ? 'followup_overdue' : 'followup_due',
        overdue ? 'Follow-up overdue' : 'Follow-up due soon',
        `${f.type} with ${leadName(f.leadId)}`,
        '/follow-ups',
        int(env, 10, 900),
      )
    }
    for (const c of conversations.filter((x) => x.assignedTo === user.id && x.unreadCount > 0)) {
      add(
        user.id,
        'whatsapp_reply',
        'New reply',
        `${c.contactName ?? leadName(c.leadId ?? '')}: ${c.lastMessagePreview}`,
        `/inbox/${c.id}`,
        int(env, 2, 600),
      )
    }
    const won = sales.deals.find(
      (d) => d.ownerId === user.id && d.closedAt && !d.lostReasonId && d.probability === 100,
    )
    if (won) add(user.id, 'deal_won', 'Deal won', won.title, `/deals/${won.id}`, int(env, 60, 5000))
    const lost = sales.deals.find((deal) => deal.ownerId === user.id && deal.lostReasonId)
    if (lost) add(user.id, 'deal_lost', 'Deal lost', lost.title, `/deals/${lost.id}`, int(env, 80, 4000))
    if (user.role !== 'salesperson') {
      add(user.id, 'import_finished', 'Import finished', '12 leads were imported.', '/leads', int(env, 200, 8000))
      add(user.id, 'merge_completed', 'Leads merged', 'A duplicate was merged.', '/leads', int(env, 300, 7000))
    }
    if (user.role === 'manager' || user.role === 'admin' || user.role === 'super_admin') {
      add(
        user.id,
        'leads_overdue',
        'Leads need attention',
        `${int(env, 3, 9)} leads have overdue follow-ups.`,
        '/follow-ups',
        int(env, 30, 600),
      )
    }
    if (mine.length > 0) {
      add(
        user.id,
        'lead_uncontacted',
        'Lead not contacted',
        `${pick(env, mine).name} has not been contacted yet.`,
        '/leads',
        int(env, 60, 2000),
      )
    }
  }

  return drafts
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(({ read, ...draft }, index): Notification => ({
      ...draft,
      id: seedId(env, 'notif', index + 1),
      tenantId: env.tenantId,
      readAt: read
        ? new Date(
            Math.min(now, Date.parse(draft.createdAt) + int(env, MINUTE, 3 * HOUR)),
          ).toISOString()
        : null,
    }))
}
