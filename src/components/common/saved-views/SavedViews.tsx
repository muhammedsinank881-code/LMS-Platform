import { useState } from 'react'
import { Check, MoreHorizontal, Star } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import type { SavedView } from '@/types'
import { SaveViewDialog } from './SaveViewDialog'

export interface SavedViewsProps {
  views: SavedView[]
  selectedId: string | null
  isDirty: boolean
  defaultViewId: string | null
  onSelect: (view: SavedView | null) => void
  onSaveCurrent: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string | null) => void
}

export function SavedViews({
  views,
  selectedId,
  isDirty,
  defaultViewId,
  onSelect,
  onSaveCurrent,
  onRename,
  onDelete,
  onSetDefault,
}: SavedViewsProps) {
  const [saveOpen, setSaveOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const presets = views.filter((view) => view.isPreset)
  const custom = views.filter((view) => !view.isPreset)
  const selected = views.find((view) => view.id === selectedId) ?? null

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <Tabs
          value={selectedId ?? 'all'}
          onValueChange={(id) => {
            if (id === 'all') onSelect(null)
            else {
              const view = views.find((item) => item.id === id)
              if (view) onSelect(view)
            }
          }}
          variant="pill"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {presets.map((view) => (
              <TabsTrigger key={view.id} value={view.id}>
                <span aria-hidden="true">{view.icon}</span>
                {view.name}
                {defaultViewId === view.id ? <Star className="h-3 w-3 fill-current" /> : null}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all" forceMount className="sr-only">All</TabsContent>
          {presets.map((view) => (
            <TabsContent key={view.id} value={view.id} forceMount className="sr-only">
              {view.name}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="flex shrink-0 items-center gap-2">
      {custom.length > 0 ? (
        <Dropdown>
          <DropdownTrigger asChild>
            <Button variant="outline" size="sm">
              My views
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            {custom.map((view) => (
              <DropdownItem key={view.id} onSelect={() => onSelect(view)}>
                <span aria-hidden="true">{view.icon}</span>
                {view.name}
                {selectedId === view.id ? <Check className="ml-auto" /> : null}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>
      ) : null}

      {isDirty && selected ? (
        <span className="text-xs text-muted-foreground">Modified</span>
      ) : null}

      <Button variant="outline" size="sm" onClick={() => setSaveOpen(true)}>
        Save view
      </Button>

      {selected && !selected.isPreset ? (
        <Dropdown>
          <DropdownTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="View actions">
              <MoreHorizontal />
            </Button>
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem onSelect={() => setRenameOpen(true)}>Rename</DropdownItem>
            <DropdownItem
              onSelect={() => onSetDefault(defaultViewId === selected.id ? null : selected.id)}
            >
              {defaultViewId === selected.id ? 'Clear default' : 'Set as default'}
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem destructive onSelect={() => onDelete(selected.id)}>
              Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      ) : selected ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetDefault(defaultViewId === selected.id ? null : selected.id)}
        >
          {defaultViewId === selected.id ? 'Default' : 'Set default'}
        </Button>
      ) : null}
      </div>

      <SaveViewDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        onSubmit={(name) => {
          onSaveCurrent(name)
          setSaveOpen(false)
        }}
      />
      <SaveViewDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename view"
        initialName={selected?.name ?? ''}
        confirmLabel="Rename"
        onSubmit={(name) => {
          if (selected) onRename(selected.id, name)
          setRenameOpen(false)
        }}
      />
    </div>
  )
}
