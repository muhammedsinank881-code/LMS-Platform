import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type BadgeTone,
} from '@/components/ui'
import { Section, Specimen } from './Section'

const TONES: BadgeTone[] = [
  'neutral',
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
  'hot',
  'warm',
  'cold',
]

const AVATAR_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#6366f1"/><circle cx="20" cy="16" r="7" fill="#fff"/><path d="M6 40c2-10 10-14 14-14s12 4 14 14z" fill="#fff"/></svg>',
  )

export function BadgeSection() {
  return (
    <Section
      id="badge"
      title="Badge"
      description="Soft badges keep AA-contrast text and carry color on the dot. Solid success / info / hot / cold use white text and fall slightly under 4.5:1: prefer soft for small text."
    >
      <Specimen label="Soft (default) with dot">
        {TONES.map((tone) => (
          <Badge key={tone} tone={tone} dot>
            {tone}
          </Badge>
        ))}
      </Specimen>
      <Specimen label="Solid">
        {TONES.map((tone) => (
          <Badge key={tone} tone={tone} appearance="solid">
            {tone}
          </Badge>
        ))}
      </Specimen>
      <Specimen label="Sizes">
        <Badge size="sm" tone="primary">
          Small
        </Badge>
        <Badge size="md" tone="primary">
          Medium
        </Badge>
        <Badge size="lg" tone="primary">
          Large
        </Badge>
      </Specimen>
      <Specimen label="Score categories">
        <Badge tone="hot" dot>
          Hot · 86
        </Badge>
        <Badge tone="warm" dot>
          Warm · 54
        </Badge>
        <Badge tone="cold" dot>
          Cold · 21
        </Badge>
      </Specimen>
    </Section>
  )
}

export function CardSection() {
  return (
    <Section
      id="card"
      title="Card"
      description="1px border, no shadow. Compose header, content and footer."
    >
      <Specimen label="Variants" className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Default</CardTitle>
            <CardDescription>Surface background with a gray border.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">Body content goes here.</CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </CardFooter>
        </Card>
        <Card variant="muted">
          <CardHeader>
            <CardTitle>Muted</CardTitle>
            <CardDescription>For secondary or grouped content.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">Body content goes here.</CardContent>
        </Card>
        <Card variant="interactive" tabIndex={0}>
          <CardHeader>
            <CardTitle>Interactive</CardTitle>
            <CardDescription>Hover tint. Wrap in a link or button for navigation.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">Focusable via keyboard.</CardContent>
        </Card>
      </Specimen>
    </Section>
  )
}

export function AvatarSection() {
  return (
    <Section id="avatar" title="Avatar" description="Image with initials fallback.">
      <Specimen label="Sizes (initials)">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Avatar key={size} size={size} name="Rahul Sharma" />
        ))}
      </Specimen>
      <Specimen label="Image, broken image fallback, single name, square">
        <Avatar name="Priya Nair" src={AVATAR_SRC} size="lg" />
        <Avatar name="Broken Image" src="/does-not-exist.png" size="lg" />
        <Avatar name="Madonna" size="lg" />
        <Avatar name="Acme Corp" shape="square" size="lg" />
      </Specimen>
    </Section>
  )
}
