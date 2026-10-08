import { BookOpen, Calendar, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/store/auth-store'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const name = user?.name || 'Ms. Husna'

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="My Profile"
        description="View your mentor profile and academic responsibilities"
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Profile' },
        ]}
      />

      {/* Header Profile Card */}
      <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-primary-subtle text-primary text-xl font-bold flex items-center justify-center border-2 border-primary/30 shrink-0">
          {name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{name}</h2>
              <p className="text-xs sm:text-sm font-semibold text-primary">
                Senior Teacher • Computer Science Department
              </p>
            </div>

            <Badge tone="success" className="self-center sm:self-start">
              Active Mentor
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
            Passionate software engineer and computer science lecturer with 6+ years of experience in Web Development, Database Systems, and mentoring capstone project teams.
          </p>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info */}
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Contact Information
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-primary" />
              <span>{user?.email || 'husna.teacher@leadflow-lms.edu'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-primary" />
              <span>+91 98765 43200</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-primary" />
              <span>Main CS Faculty Block, Room 302</span>
            </div>
          </div>
        </Card>

        {/* Academic Responsibilities */}
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Assigned Responsibilities
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" /> Assigned Batches
              </span>
              <span className="font-bold">3 Batches (24 Students)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" /> Office Hours
              </span>
              <span className="font-bold">Mon & Thu (02:00 PM - 04:00 PM)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Role Scope
              </span>
              <span className="font-bold">Teacher / Mentor</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export const Profile = ProfilePage
export default ProfilePage
