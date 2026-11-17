export type Role = 'HRD' | 'EMPLOYEE'
export type PhotoSource = 'CAMERA' | 'FILE'

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

export interface UpdateEmployeeInput {
  fullName: string
  department: string
  jobTitle: string
  email: string
  password?: string
}

export interface AttendanceRecord {
  id: string
  workDate: string
  submittedAt: string
  fullName: string
  employeeNo: string
  department: string
  note: string
  source: PhotoSource
}

export interface TodayAttendance {
  workDate: string
  record: AttendanceRecord | null
}

export interface Challenge {
  token: string
  expiresAt: string
}

export interface ListAttendanceParams {
  page: number
  limit: number
  date?: string
  q?: string
}