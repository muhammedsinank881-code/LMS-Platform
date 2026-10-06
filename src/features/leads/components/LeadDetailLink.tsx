import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { rememberLeadListSearch } from '../lib/list-return'

/** Link to a lead that keeps the current list filters for the back button. */
export function LeadDetailLink({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: ReactNode
}) {
  const location = useLocation()
  return (
    <Link
      to={`/leads/${id}`}
      state={{ listSearch: location.search }}
      className={className}
      onClick={() => rememberLeadListSearch(location.search)}
    >
      {children}
    </Link>
  )
}
