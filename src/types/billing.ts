import type { TenantPlan } from './auth'

export interface PlanLimits {
  users: number
  leads: number
  storageMb: number
}

export interface BillingInvoice {
  id: string
  issuedAt: string
  amount: number
  status: 'paid'
}

export interface BillingSnapshot {
  plan: TenantPlan
  limits: PlanLimits
  usage: PlanLimits
  invoices: BillingInvoice[]
}

export const PLAN_LIMITS: Record<TenantPlan, PlanLimits> = {
  free: { users: 3, leads: 200, storageMb: 200 },
  pro: { users: 25, leads: 10000, storageMb: 5000 },
  enterprise: { users: 200, leads: 100000, storageMb: 50000 },
}
