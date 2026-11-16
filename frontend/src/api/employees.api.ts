import type { CreateEmployeeInput, Employee, Paginated } from '../types'
import { http } from './http'

export const employeesApi = {
  list: ({ q, page, limit }: { q?: string; page: number; limit: number }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (q) params.set('q', q)
    return http<Paginated<Employee>>(`/employees?${params}`)
  },
  create: (input: CreateEmployeeInput) => http<Employee>('/employees', { method: 'POST', json: input }),
}