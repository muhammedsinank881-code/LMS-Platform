import { useState } from 'react'
import { Checkbox, Label, MultiSelect, Select, Switch, type SelectItemData } from '@/components/ui'
import { Section, Specimen } from './Section'

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

const SIMPLE_OPTIONS: SelectItemData[] = [
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'referral', label: 'Referral', disabled: true },
]

const GROUPED_OPTIONS: SelectItemData[] = [
  {
    label: 'Open',
    options: [
      { value: 'new', label: 'New' },
      { value: 'contacted', label: 'Contacted' },
    ],
  },
  {
    label: 'Closed',
    options: [
      { value: 'won', label: 'Won' },
      { value: 'lost', label: 'Lost' },
    ],
  },
]

const MULTI_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'smb', label: 'SMB' },
  { value: 'renewal', label: 'Renewal' },
  { value: 'partner', label: 'Partner' },
  { value: 'event', label: 'Event' },
]

export function SelectSection() {
  const [source, setSource] = useState('website')

  return (
    <Section
      id="select"
      title="Select"
      description="Single choice. Type-ahead and arrow keys work."
    >
      <Specimen label="Sizes" className={GRID}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="space-y-2">
            <Label id={`sel-${size}-label`}>Source ({size})</Label>
            <Select
              size={size}
              aria-labelledby={`sel-${size}-label`}
              options={SIMPLE_OPTIONS}
              value={size === 'md' ? source : undefined}
              onValueChange={size === 'md' ? setSource : undefined}
              placeholder="Choose a source"
            />
          </div>
        ))}
      </Specimen>
      <Specimen label="Groups, invalid, disabled" className={GRID}>
        <div className="space-y-2">
          <Label id="sel-group-label">Grouped</Label>
          <Select
            aria-labelledby="sel-group-label"
            options={GROUPED_OPTIONS}
            placeholder="Pick a status"
          />
        </div>
        <div className="space-y-2">
          <Label id="sel-invalid-label">Invalid</Label>
          <Select
            aria-labelledby="sel-invalid-label"
            invalid
            options={SIMPLE_OPTIONS}
            placeholder="Required"
          />
        </div>
        <div className="space-y-2">
          <Label id="sel-disabled-label">Disabled</Label>
          <Select
            aria-labelledby="sel-disabled-label"
            disabled
            options={SIMPLE_OPTIONS}
            defaultValue="website"
          />
        </div>
      </Specimen>
    </Section>
  )
}

export function MultiSelectSection() {
  const [tags, setTags] = useState<string[]>(['priority', 'enterprise', 'smb', 'event'])
  const [small, setSmall] = useState<string[]>([])

  return (
    <Section
      id="multi-select"
      title="MultiSelect"
      description="Searchable multi-choice. Chips are removable; overflow collapses to +N."
    >
      <Specimen label="Default (maxVisible 3), with search and clear" className={GRID}>
        <div className="space-y-2 sm:col-span-2">
          <Label id="ms-label">Tags</Label>
          <MultiSelect
            aria-label="Tags"
            options={MULTI_OPTIONS}
            value={tags}
            onValueChange={setTags}
            placeholder="Add tags"
          />
        </div>
        <div className="space-y-2">
          <Label id="ms-small-label">Small, empty</Label>
          <MultiSelect
            aria-label="Tags (small)"
            size="sm"
            options={MULTI_OPTIONS}
            value={small}
            onValueChange={setSmall}
            placeholder="Add tags"
          />
        </div>
      </Specimen>
      <Specimen label="Invalid, disabled" className={GRID}>
        <MultiSelect
          aria-label="Invalid tags"
          invalid
          options={MULTI_OPTIONS}
          value={[]}
          onValueChange={() => {}}
          placeholder="Required"
        />
        <MultiSelect
          aria-label="Disabled tags"
          disabled
          options={MULTI_OPTIONS}
          value={['smb']}
          onValueChange={() => {}}
        />
      </Specimen>
    </Section>
  )
}

export function CheckboxSwitchSection() {
  const [all, setAll] = useState<boolean | 'indeterminate'>('indeterminate')
  const [notify, setNotify] = useState(true)

  return (
    <Section
      id="checkbox-switch"
      title="Checkbox & Switch"
      description="Space toggles. Pair with a Label."
    >
      <Specimen label="Checkbox states">
        <div className="flex items-center gap-2">
          <Checkbox id="cb-1" />
          <Label htmlFor="cb-1">Unchecked</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cb-2" defaultChecked />
          <Label htmlFor="cb-2">Checked</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cb-3" checked={all} onCheckedChange={setAll} />
          <Label htmlFor="cb-3">Indeterminate (select all)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cb-4" disabled />
          <Label htmlFor="cb-4">Disabled</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cb-5" size="sm" defaultChecked />
          <Label htmlFor="cb-5">Small</Label>
        </div>
      </Specimen>
      <Specimen label="Switch">
        <div className="flex items-center gap-2">
          <Switch id="sw-1" checked={notify} onCheckedChange={setNotify} />
          <Label htmlFor="sw-1">Email notifications ({notify ? 'on' : 'off'})</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sw-2" size="sm" defaultChecked />
          <Label htmlFor="sw-2">Small</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sw-3" disabled />
          <Label htmlFor="sw-3">Disabled</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sw-4" disabled defaultChecked />
          <Label htmlFor="sw-4">Disabled on</Label>
        </div>
      </Specimen>
    </Section>
  )
}
