import { useState } from 'react'
import { Copy, Download, MoreHorizontal, Pencil, Plus, Trash2, UserPlus } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownCheckboxItem,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSeparator,
  DropdownShortcut,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
  Tooltip,
} from '@/components/ui'
import { Section, Specimen } from './Section'

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const

export function ButtonSection() {
  return (
    <Section id="button" title="Button" description="Six variants, six sizes, loading and asChild.">
      <Specimen label="Variants">
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Specimen>
      <Specimen label="Sizes">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Specimen>
      <Specimen label="Icon buttons">
        <Button size="icon-sm" variant="outline" aria-label="Add">
          <Plus />
        </Button>
        <Button size="icon" variant="outline" aria-label="Add">
          <Plus />
        </Button>
        <Button size="icon-lg" variant="outline" aria-label="Add">
          <Plus />
        </Button>
      </Specimen>
      <Specimen label="With icon">
        <Button>
          <Plus /> Add lead
        </Button>
        <Button variant="outline">
          <Download /> Export
        </Button>
      </Specimen>
      <Specimen label="States">
        <Button disabled>Disabled</Button>
        <Button loading>Saving</Button>
        <Button variant="outline" loading>
          Loading
        </Button>
        <Button variant="destructive" disabled>
          Disabled
        </Button>
      </Specimen>
      <Specimen label="asChild (renders the child element)">
        <Button asChild variant="outline">
          <a href="#button">Anchor styled as button</a>
        </Button>
      </Specimen>
    </Section>
  )
}

export function DropdownSection() {
  const [showArchived, setShowArchived] = useState(false)
  const [density, setDensity] = useState('comfortable')

  return (
    <Section
      id="dropdown"
      title="Dropdown"
      description="Arrow keys to move, Enter/Space to select, Right/Left for submenus, Esc to close."
    >
      <Specimen label="Menu with icons, shortcuts, checkbox, radio, submenu and destructive item">
        <Dropdown>
          <DropdownTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Row actions">
              <MoreHorizontal />
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>Lead actions</DropdownLabel>
            <DropdownItem>
              <Pencil /> Edit <DropdownShortcut>E</DropdownShortcut>
            </DropdownItem>
            <DropdownItem>
              <Copy /> Duplicate
            </DropdownItem>
            <DropdownItem disabled>
              <UserPlus /> Assign (disabled)
            </DropdownItem>
            <DropdownSub>
              <DropdownSubTrigger>
                <Download /> Export
              </DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownItem>CSV</DropdownItem>
                <DropdownItem>Excel</DropdownItem>
              </DropdownSubContent>
            </DropdownSub>
            <DropdownSeparator />
            <DropdownCheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
              Show archived
            </DropdownCheckboxItem>
            <DropdownSeparator />
            <DropdownLabel>Density</DropdownLabel>
            <DropdownRadioGroup value={density} onValueChange={setDensity}>
              <DropdownRadioItem value="comfortable">Comfortable</DropdownRadioItem>
              <DropdownRadioItem value="compact">Compact</DropdownRadioItem>
            </DropdownRadioGroup>
            <DropdownSeparator />
            <DropdownItem destructive>
              <Trash2 /> Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </Specimen>
    </Section>
  )
}

export function TooltipSection() {
  return (
    <Section
      id="tooltip"
      title="Tooltip"
      description="Opens on hover and keyboard focus. Never put essential information only in a tooltip."
    >
      <Specimen label="Sides">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side} content={`Tooltip on ${side}`} side={side}>
            <Button variant="outline">{side}</Button>
          </Tooltip>
        ))}
      </Specimen>
      <Specimen label="Icon button label">
        <Tooltip content="Add a new lead">
          <Button size="icon" aria-label="Add a new lead">
            <Plus />
          </Button>
        </Tooltip>
      </Specimen>
    </Section>
  )
}
