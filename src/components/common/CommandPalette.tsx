import { Command } from 'cmdk'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal, ModalContent, ModalDescription, ModalTitle } from '@/components/ui'
import { NAV_ITEMS } from '@/components/layout/nav-config'
import { usePermission } from '@/hooks/use-permission'
import { useUiStore } from '@/store/ui-store'

const itemClasses =
  'flex min-h-9 cursor-default select-none items-center gap-3 rounded-sm px-2 py-2 text-sm text-foreground data-[selected=true]:bg-muted max-sm:min-h-11 [&_svg]:size-4 [&_svg]:text-muted-foreground'

/**
 * Cmd/Ctrl+K palette. Navigation commands only for now; lead search and quick actions
 * join once those modules exist.
 */
export function CommandPalette() {
  const open = useUiStore((state) => state.commandPaletteOpen)
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen)
  const navigate = useNavigate()
  const { can } = usePermission()

  const items = NAV_ITEMS.filter((item) => can(item.resource, 'view'))

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent size="lg" hideClose className="overflow-hidden p-0">
        <ModalTitle className="sr-only">Command palette</ModalTitle>
        <ModalDescription className="sr-only">Search for a page to jump to.</ModalDescription>
        <Command label="Command palette">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Jump to a page…"
              className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-2 py-8 text-center text-sm text-muted-foreground">
              No matching pages.
            </Command.Empty>
            <Command.Group
              heading="Go to"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {items.map((item) => (
                <Command.Item
                  key={item.resource}
                  value={item.label}
                  className={itemClasses}
                  onSelect={() => {
                    setOpen(false)
                    navigate(item.path)
                  }}
                >
                  <item.icon aria-hidden="true" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </ModalContent>
    </Modal>
  )
}
