export interface SupportTicket {
  id: string
  studentId: string
  subject: string
  category: string
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
}

export interface ResourceItem {
  id: string
  title: string
  type: 'document' | 'video' | 'link' | 'code'
  url: string
}
