import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Edit3, Eye, Megaphone, MoreVertical, Share2, Trash2 } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  toast,
} from '@/components/ui'
import { AnnouncementDetailsModal } from './AnnouncementDetailsModal'
import type { AnnouncementItem } from '../types'

interface AnnouncementsCardProps {
  announcements: AnnouncementItem[]
  onDeleteAnnouncement?: (id: string) => void
  onEditAnnouncement?: (announcement: AnnouncementItem) => void
}

export function AnnouncementsCard({
  announcements,
  onDeleteAnnouncement,
  onEditAnnouncement,
}: AnnouncementsCardProps) {
  const navigate = useNavigate()
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null)

  const handleCopyLink = (announcement: AnnouncementItem) => {
    const url = `${window.location.origin}/mentor/announcements?id=${announcement.id}`
    void navigator.clipboard.writeText(url)
    toast.success('Announcement link copied to clipboard')
  }

  const handleDelete = (announcement: AnnouncementItem) => {
    if (onDeleteAnnouncement) {
      onDeleteAnnouncement(announcement.id)
    }
    toast.success('Announcement removed')
  }

  const handleEdit = (announcement: AnnouncementItem) => {
    if (onEditAnnouncement) {
      onEditAnnouncement(announcement)
    } else {
      toast.info(`Editing notice: "${announcement.title}"`)
    }
  }

  return (
    <>
      <div className="space-y-2 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
            Announcements
          </h2>
          <Link
            to="/mentor/announcements"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            View All <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="space-y-2.5 flex-1 flex flex-col justify-between">
          {announcements.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-lg bg-surface">
              <Megaphone className="size-6 text-muted-foreground mb-1.5" />
              <p className="text-xs font-semibold text-foreground">No announcements posted</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                New notices and department alerts will appear here.
              </p>
            </div>
          ) : (
            announcements.map((item) => (
              <Card
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedAnnouncement(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedAnnouncement(item)
                  }
                }}
                aria-label={`View notice: ${item.title}`}
                className="border-border bg-surface shadow-2xs transition-all hover:border-primary/50 hover:shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary flex-1 flex flex-col justify-center cursor-pointer select-none group"
              >
                <CardContent className="p-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-primary-subtle text-primary shrink-0 transition-transform group-hover:scale-105">
                      <Megaphone className="size-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      {item.category ? (
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {item.category}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge tone="info" appearance="soft" size="sm" className="text-[10px] px-2 h-5">
                      {item.date}
                    </Badge>

                    {/* Three-dot dropdown menu */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Dropdown>
                        <DropdownTrigger asChild>
                          <button
                            type="button"
                            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`Actions for ${item.title}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                        </DropdownTrigger>
                        <DropdownContent align="end" className="w-48">
                          <DropdownItem
                            onClick={() => setSelectedAnnouncement(item)}
                            className="cursor-pointer"
                          >
                            <Eye className="size-3.5 mr-2 text-primary" />
                            <span>View Notice</span>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => handleCopyLink(item)}
                            className="cursor-pointer"
                          >
                            <Share2 className="size-3.5 mr-2 text-muted-foreground" />
                            <span>Share / Copy Link</span>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => handleEdit(item)}
                            className="cursor-pointer"
                          >
                            <Edit3 className="size-3.5 mr-2 text-muted-foreground" />
                            <span>Edit Announcement</span>
                          </DropdownItem>
                          <DropdownItem
                            destructive
                            onClick={() => handleDelete(item)}
                            className="cursor-pointer"
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            <span>Delete</span>
                          </DropdownItem>
                        </DropdownContent>
                      </Dropdown>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Announcement Details Modal */}
      <AnnouncementDetailsModal
        announcement={selectedAnnouncement}
        open={Boolean(selectedAnnouncement)}
        onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  )
}
