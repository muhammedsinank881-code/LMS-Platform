import { cva } from 'class-variance-authority'

/** Visible keyboard focus ring for buttons, tabs, links and other non-field controls. */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Focus treatment for text-like fields (ring hugs the border, no offset). */
export const fieldFocus =
  'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0'

/**
 * Floating surface shared by Select, Dropdown, MultiSelect and Tooltip-like popovers.
 * z-50 sits above modals/drawers (z-40).
 */
export const popoverSurface =
  'z-50 rounded-md border border-border bg-surface text-foreground shadow-popover'

/** Row styling shared by Select, Dropdown and MultiSelect items (Radix + cmdk highlight states). */
export const menuItem =
  'relative flex min-h-9 cursor-default select-none items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-muted data-[selected=true]:bg-muted max-sm:min-h-11 [&_svg]:size-4 [&_svg]:shrink-0'

/** Shared look for Input, Textarea, Select trigger and MultiSelect. 44px touch height and 16px type on phones. */
export const fieldVariants = cva(
  `w-full rounded-md border border-input bg-surface text-foreground transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 max-sm:scroll-mb-28 ${fieldFocus}`,
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm max-sm:h-11 max-sm:text-base',
        md: 'h-10 px-3 text-sm max-sm:h-11 max-sm:text-base',
        lg: 'h-12 px-4 text-base',
        multiline: 'min-h-24 px-3 py-2 text-sm max-sm:text-base',
      },
      invalid: {
        true: 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive',
        false: '',
      },
    },
    defaultVariants: { size: 'md', invalid: false },
  },
)

export type FieldSize = 'sm' | 'md' | 'lg'
