import { currencySymbol } from '@/lib/format/currency'
import { useAuthStore } from '@/store/auth-store'

/** Symbol for the signed-in workspace, falling back to INR before a tenant is loaded. */
export function useCurrencySymbol(): string {
  const currency = useAuthStore((state) => state.tenant?.currency ?? 'INR')
  return currencySymbol(currency)
}
