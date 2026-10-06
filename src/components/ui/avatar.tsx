import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const avatarVariants = cva(
  'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-muted font-medium text-foreground',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
    },
    defaultVariants: { size: 'md', shape: 'circle' },
  },
)

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** Person or company name: used for initials and as the accessible name. */
  name: string
  src?: string | null
  className?: string
}

const AVATAR_PX = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 } as const

export function Avatar({ name, src, size, shape, className }: AvatarProps) {
  const pixels = AVATAR_PX[size ?? 'md']
  return (
    <AvatarPrimitive.Root
      role="img"
      aria-label={name}
      className={cn(avatarVariants({ size, shape }), className)}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt=""
          width={pixels}
          height={pixels}
          loading="lazy"
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback aria-hidden="true" delayMs={src ? 300 : 0}>
        {getInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
