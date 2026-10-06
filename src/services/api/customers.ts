import type {
  Activity,
  Company,
  CompanyListParams,
  CreateCustomerInput,
  Customer,
  CustomerId,
  CustomerListParams,
  Paginated,
  UpdateCustomerInput,
} from '@/types'
import type { CrudClient } from './resource'

export type CompanyInput = Omit<Company, 'id' | 'tenantId' | 'createdAt'>

export interface CustomersApiClient extends CrudClient<
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListParams,
  CustomerId
> {
  /** The originating lead's full activity history. */
  getTimeline(id: CustomerId): Promise<Activity[]>
  listCompanies(params?: CompanyListParams): Promise<Paginated<Company>>
  getCompany(id: string): Promise<Company>
  createCompany(input: CompanyInput): Promise<Company>
  updateCompany(id: string, patch: Partial<CompanyInput>): Promise<Company>
}
