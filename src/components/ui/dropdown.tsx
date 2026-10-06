import type { ComponentProps } from 'react'
import * as MenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { menuItem, popoverSurface } from './styles'

export const Dropdown = MenuPrimitive.Root
export const DropdownTrigger = MenuPrimitive.Trigger
export const DropdownGroup = MenuPrimitive.Group
export const DropdownSub = MenuPrimitive.Sub
export const DropdownRadioGroup = MenuPrimitive.RadioGroup

const contentClasses = cn(popoverSurface, 'min-w-48 overflow-hidden p-1')

export function DropdownContent({
  className,
  sideOffset = 4,
  align = 'start',
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(contentClasses, className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}

export interface DropdownItemProps extends ComponentProps<typeof MenuPrimitive.Item> {
  /** Red text for irreversible actions (delete, remove). */
  destructive?: boolean
  /** Indent to line up with items that have a check/radio indicator. */
  inset?: boolean
}

export function DropdownItem({ className, destructive, inset, ...props }: DropdownItemProps) {
  return (
    <MenuPrimitive.Item
      className={cn(
        menuItem,
        inset && 'pl-8',
        destructive && 'text-destructive data-[highlighted]:bg-destructive/10',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem className={cn(menuItem, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <MenuPrimitive.ItemIndicator>
          <Check aria-hidden="true" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

export function DropdownRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem className={cn(menuItem, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <MenuPrimitive.ItemIndicator>
          <Circle className="!size-2 fill-current" aria-hidden="true" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

export function DropdownLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof MenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <MenuPrimitive.Label
      className={cn(
        'px-2 py-2 text-xs font-medium text-muted-foreground',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownSeparator({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
  )
}

export function DropdownShortcut({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('ml-auto pl-4 text-xs text-muted-foreground', className)} {...props} />
}

export function DropdownSubTrigger({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <MenuPrimitive.SubTrigger
      className={cn(menuItem, 'data-[state=open]:bg-muted', inset && 'pl-8', className)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" aria-hidden="true" />
    </MenuPrimitive.SubTrigger>
  )
}

export function DropdownSubContent({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.SubContent>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent className={cn(contentClasses, className)} {...props} />
    </MenuPrimitive.Portal>
  )
}
