import type { ReactNode } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { useMediaQuery } from '@/hooks/use-media-query'

export interface FilterSheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: ReactNode
  children: ReactNode
}

/** Popover on desktop, full-width bottom sheet on phones and tablets. */
export function FilterSheet({ open, onOpenChange, trigger, children }: FilterSheetProps) {
  const mobile = useMediaQuery('(max-width: 1023px)')

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent side="bottom">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow the list, then apply.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,40rem)] p-4" align="start">
        {children}
      </PopoverContent>
    </Popover>
  )
}
