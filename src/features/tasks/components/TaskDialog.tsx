import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import type { Task } from '@/types'
import { TaskForm } from './TaskForm'
import type { TaskFormValues } from '../schemas'

export function TaskDialog({
  open,
  task,
  assigneeId,
  leadId,
  lockLead,
  leadLabel,
  deals,
  submitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  task?: Task | null
  assigneeId: string
  leadId?: string
  lockLead?: boolean
  leadLabel?: string
  deals: Array<{ id: string; label: string }>
  submitting?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TaskFormValues) => Promise<void>
}) {
  const mobile = useMediaQuery('(max-width: 767px)')
  const title = task ? 'Edit task' : 'New task'
  const form = open ? (
    <TaskForm
      key={task?.id ?? 'new'}
      task={task}
      assigneeId={assigneeId}
      leadId={leadId}
      lockLead={lockLead}
      leadLabel={leadLabel}
      deals={deals}
      submitting={submitting}
      onCancel={() => onOpenChange(false)}
      onSubmit={onSubmit}
    />
  ) : null

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent side="right" className="h-dvh sm:max-w-none">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>Title, due date, and who owns it.</DrawerDescription>
          </DrawerHeader>
          {form}
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="max-h-[90vh]">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>Title, due date, and who owns it.</ModalDescription>
        </ModalHeader>
        {form}
      </ModalContent>
    </Modal>
  )
}
