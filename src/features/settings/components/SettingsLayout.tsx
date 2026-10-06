import { useMemo, type ReactNode } from 'react'
import { NavLink, Navigate, Outlet, useBlocker } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { NoAccess } from '@/components/common/NoAccess'
import { Button } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { cn } from '@/lib/cn'
import { SETTINGS_LINKS } from '../sections'
import { SaveBarContext, useSaveBarState } from './use-save-bar'

export function SettingsLayout() {
  const { can, canSection } = usePermission()
  const links = SETTINGS_LINKS.filter((link) => canSection(link.section))
  const [save, setSave] = useSaveBarState()
  const blocker = useBlocker(Boolean(save?.dirty))
  const value = useMemo(() => ({ setSave }), [setSave])

  if (!can('settings', 'view') || links.length === 0) return <NoAccess />

  return (
    <SaveBarContext.Provider value={value}>
      <PageHeader title="Settings" description="Workspace configuration for this tenant." />
      <nav aria-label="Settings" className="mb-6 overflow-x-auto overflow-y-hidden border-b border-border">
        <ul className="flex w-max min-w-full items-center gap-1">
          {links.map((link) => (
            <li key={link.section} className="shrink-0">
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    '-mb-px inline-flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm',
                    isActive
                      ? 'border-primary font-medium text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
      {save?.dirty ? (
        <div className="sticky bottom-0 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p className="text-sm text-foreground">You have unsaved changes.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={save.discard}>
              Discard
            </Button>
            <Button loading={save.saving} onClick={save.save}>
              Save
            </Button>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={() => blocker.reset?.()}
        title="Leave without saving?"
        description="Your changes on this page will be lost."
        confirmLabel="Leave"
        destructive
        onConfirm={() => blocker.proceed?.()}
      />
    </SaveBarContext.Provider>
  )
}

export function SettingsIndex() {
  const { canSection } = usePermission()
  const first = SETTINGS_LINKS.find((link) => canSection(link.section))
  if (!first) return <NoAccess />
  return <Navigate to={first.path} replace />
}

export function SectionIntro({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </header>
  )
}
