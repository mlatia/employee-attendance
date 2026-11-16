export type Role = 'HRD' | 'EMPLOYEE'

export interface User {
  id: string
  email: string
  role: Role
  fullName: string
  employeeNo: string
}

export interface Employee {
  id: string
  employeeNo: string
  fullName: string
  department: string
  jobTitle: string
  email: string
  role: Role
  active: boolean
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface CreateEmployeeInput {
  employeeNo: string
  fullName: string
  department: string
  jobTitle: string
  email: string
  password: string
  role: Role
}