import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui'
import { MOCK_CERTIFICATE_DATA } from '@/student-features/certificate/data/certificateData'
import { CertificateCard } from '@/student-features/certificate/components/CertificateCard'

export function StudentCertificatesWidget() {
  const navigate = useNavigate()
  const cert = MOCK_CERTIFICATE_DATA

  return (
    <Card className="flex h-full flex-col p-4">
      <button
        type="button"
        onClick={() => navigate('/student/certificates')}
        className="bg-surface-hover flex flex-1 items-center rounded-lg text-left hover:bg-amber-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View certificate: ${cert.title}`}
      >
        <CertificateCard cert={cert} isEarned={false} />
      </button>
    </Card>
  )
}
