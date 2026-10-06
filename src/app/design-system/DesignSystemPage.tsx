import { ButtonSection, DropdownSection, TooltipSection } from './ActionSections'
import { CheckboxSwitchSection, MultiSelectSection, SelectSection } from './ChoiceSections'
import { AvatarSection, BadgeSection, CardSection } from './DisplaySections'
import {
  EmptyStateSection,
  ProgressSection,
  SkeletonSection,
  ToastSection,
} from './FeedbackSections'
import { PaginationSection, TabsSection } from './NavigationSections'
import { DrawerSection, ModalSection } from './OverlaySections'
import { InputSection, TextareaSection } from './TextFieldSections'

const NAV = [
  ['button', 'Button'],
  ['input', 'Input'],
  ['textarea', 'Textarea'],
  ['select', 'Select'],
  ['multi-select', 'MultiSelect'],
  ['checkbox-switch', 'Checkbox & Switch'],
  ['badge', 'Badge'],
  ['card', 'Card'],
  ['avatar', 'Avatar'],
  ['modal', 'Modal'],
  ['drawer', 'Drawer'],
  ['tabs', 'Tabs'],
  ['dropdown', 'Dropdown'],
  ['tooltip', 'Tooltip'],
  ['skeleton', 'Skeleton'],
  ['empty-state', 'EmptyState'],
  ['pagination', 'Pagination'],
  ['toast', 'Toast'],
  ['progress', 'ProgressBar'],
] as const

/** Hidden route (`/design-system`): every UI primitive, variant and state in one place. */
export function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">LeadFlow design system</h1>
          <p className="text-sm text-muted-foreground">
            UI primitives from <code>components/ui</code>. Not linked from the app.
          </p>
        </div>
        <nav aria-label="Components" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-sm text-primary underline-offset-4 hover:underline"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <ButtonSection />
      <InputSection />
      <TextareaSection />
      <SelectSection />
      <MultiSelectSection />
      <CheckboxSwitchSection />
      <BadgeSection />
      <CardSection />
      <AvatarSection />
      <ModalSection />
      <DrawerSection />
      <TabsSection />
      <DropdownSection />
      <TooltipSection />
      <SkeletonSection />
      <EmptyStateSection />
      <PaginationSection />
      <ToastSection />
      <ProgressSection />
    </div>
  )
}
