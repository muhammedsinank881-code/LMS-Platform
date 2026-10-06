import { useNavigate } from 'react-router-dom'
import { QueryState } from '@/components/common/QueryState'
import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Skeleton,
} from '@/components/ui'
import { summarizeAutomation, type Lookups } from '@/lib/automation'
import { useAutomationTemplates } from '../../hooks/use-automations'

/** Ready-made automations. "Use template" opens the builder pre-filled; nothing is saved until you save. */
export function TemplateGallery({
  open,
  onOpenChange,
  lookups,
  canCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lookups: Lookups
  canCreate: boolean
}) {
  const navigate = useNavigate()
  const templates = useAutomationTemplates()
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>Start from a template</DrawerTitle>
          <DrawerDescription>Pick one, adjust it in the builder, then publish.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <QueryState
            isLoading={templates.isLoading}
            isError={templates.isError}
            onRetry={() => void templates.refetch()}
            isEmpty={(templates.data ?? []).length === 0}
            emptyTitle="No templates"
            loading={<Skeleton className="h-48 w-full" />}
          >
            <ul className="space-y-3">
              {(templates.data ?? []).map((template) => (
                <li key={template.key} className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{template.name}</h3>
                    <Badge size="sm">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <p className="text-sm leading-6">{summarizeAutomation(template, lookups)}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canCreate}
                    onClick={() => navigate(`/automations/new?template=${template.key}`)}
                  >
                    Use template
                  </Button>
                </li>
              ))}
            </ul>
          </QueryState>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
