import type { ReactNode } from 'react'
import { BarChart3, CalendarCheck, Users } from 'lucide-react'
import { BrandMark } from '@/components/layout/BrandMark'

const highlights = [
  { icon: Users, text: 'Capture every lead and know exactly who owns it' },
  { icon: CalendarCheck, text: 'Never miss a follow-up with clear daily priorities' },
  { icon: BarChart3, text: 'See pipeline value and revenue at a glance' },
]

export interface AuthLayoutProps {
  title: string
  description?: ReactNode
  children: ReactNode
  /** Links under the form, e.g. "Don't have an account?". */
  footer?: ReactNode
}

/** Split layout: form on the left, brand panel on the right (hidden below `lg`). */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <BrandMark />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {children}
          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}
        </div>
      </main>

      <aside
        aria-hidden="true"
        className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex"
      >
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-foreground/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary-foreground/5" />
        <BrandMark inverted className="relative" />
        <div className="relative max-w-md space-y-8">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            The sales operating system for fast-moving teams.
          </h2>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-foreground/15">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/70">
          © LeadFlow. Built for agencies and sales teams.
        </p>
      </aside>
    </div>
  )
}
