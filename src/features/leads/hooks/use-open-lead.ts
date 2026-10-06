import { useLocation, useNavigate } from 'react-router-dom'
import { rememberLeadListSearch } from '../lib/list-return'

/** Opens a lead and remembers the current list query for the back link. */
export function useOpenLead(): (id: string) => void {
  const navigate = useNavigate()
  const location = useLocation()
  return (id: string) => {
    rememberLeadListSearch(location.search)
    navigate(`/leads/${id}`, { state: { listSearch: location.search } })
  }
}
