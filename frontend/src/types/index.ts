export type Role = 'HRD' | 'EMPLOYEE'

export interface User {
  id: string
  email: string
  role: Role
  fullName: string
  employeeNo: string
}