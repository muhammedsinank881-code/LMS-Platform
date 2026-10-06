import { useState, type ReactNode } from 'react'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui'
import { useMediaQuery } from '@/hooks/use-media-query'

/**
 * Inline on tablets and desktops. On phones the form moves into a full-screen drawer so the
 * card stays a one-line summary.
 */
export function ConfigSurface({
  title,
  summary,
  children,
}: {
  title: string
  summary: string
  children: ReactNode
}) {
  const phone = useMediaQuery('(max-width: 767px)')
  const [open, setOpen] = useState(false)
  if (!phone) return <>{children}</>
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit {title.toLowerCase()}
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent size="lg">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{summary}</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            {children}
            <Button type="button" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
