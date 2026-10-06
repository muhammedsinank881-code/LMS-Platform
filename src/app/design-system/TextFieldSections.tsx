import { Search, X } from 'lucide-react'
import { Button, Input, Label, Textarea } from '@/components/ui'
import { Section, Specimen } from './Section'

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

export function InputSection() {
  return (
    <Section id="input" title="Input" description="Three sizes, adornments, invalid and disabled.">
      <Specimen label="Sizes" className={GRID}>
        <Field id="in-sm" label="Small">
          <Input id="in-sm" size="sm" placeholder="Small" />
        </Field>
        <Field id="in-md" label="Medium (44px on mobile)">
          <Input id="in-md" size="md" placeholder="Medium" />
        </Field>
        <Field id="in-lg" label="Large">
          <Input id="in-lg" size="lg" placeholder="Large" />
        </Field>
      </Specimen>
      <Specimen label="Adornments" className={GRID}>
        <Field id="in-search" label="Left adornment">
          <Input id="in-search" placeholder="Search leads" leftAdornment={<Search />} />
        </Field>
        <Field id="in-clear" label="Right adornment (interactive)">
          <Input
            id="in-clear"
            defaultValue="Acme Corp"
            rightAdornment={
              <Button variant="ghost" size="icon-sm" aria-label="Clear" className="-mr-2">
                <X />
              </Button>
            }
          />
        </Field>
        <Field id="in-unit" label="Right adornment (text)">
          <Input id="in-unit" type="number" placeholder="0" rightAdornment={<span>INR</span>} />
        </Field>
      </Specimen>
      <Specimen label="States" className={GRID}>
        <Field id="in-required" label="Required">
          <Input id="in-required" required placeholder="Required field" />
        </Field>
        <div className="space-y-2">
          <Label htmlFor="in-invalid" required>
            Phone
          </Label>
          <Input id="in-invalid" invalid defaultValue="12345" aria-describedby="in-invalid-msg" />
          <p id="in-invalid-msg" className="text-sm text-destructive">
            Enter a valid 10-digit phone number.
          </p>
        </div>
        <Field id="in-disabled" label="Disabled">
          <Input id="in-disabled" disabled defaultValue="Disabled value" />
        </Field>
      </Specimen>
    </Section>
  )
}

export function TextareaSection() {
  return (
    <Section id="textarea" title="Textarea" description="Vertical resize, invalid and disabled.">
      <Specimen label="States" className={GRID}>
        <Field id="ta-default" label="Default">
          <Textarea id="ta-default" placeholder="Add a note…" />
        </Field>
        <div className="space-y-2">
          <Label htmlFor="ta-invalid">Invalid</Label>
          <Textarea id="ta-invalid" invalid aria-describedby="ta-invalid-msg" defaultValue="Hi" />
          <p id="ta-invalid-msg" className="text-sm text-destructive">
            Note must be at least 10 characters.
          </p>
        </div>
        <Field id="ta-disabled" label="Disabled">
          <Textarea id="ta-disabled" disabled defaultValue="Disabled value" />
        </Field>
      </Specimen>
    </Section>
  )
}
