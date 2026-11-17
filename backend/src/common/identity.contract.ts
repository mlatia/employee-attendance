import type { AuthUser } from '../auth/auth.types';
import type { Role } from './role.enum';

export const IDENTITY_SERVICE = 'IDENTITY_SERVICE';

export const IDENTITY_PATTERNS = {
  login: 'auth.login',
  session: 'auth.session',
  revoke: 'auth.revoke',
  createEmployee: 'employees.create',
  listEmployees: 'employees.list',
  updateEmployee: 'employees.update',
  setEmployeeStatus: 'employees.setStatus',
} as const;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUser;
  authVersion: number;
}

export interface SessionPayload {
  sub: string; // employeeId
  av: number; // authVersion
}

export interface CreateEmployeePayload {
  employeeNo: string;
  fullName: string;
  department: string;
  jobTitle: string;
  email: string;
  password: string;
  role?: Role;
}

export interface ListEmployeesPayload {
  q?: string;
  page: number;
  limit: number;
}

export interface EmployeeView {
  id: string;
  employeeNo: string;
  fullName: string;
  department: string;
  jobTitle: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface UpdateEmployeePayload {
  id: string;
  employeeNo?: string;
  fullName?: string;
  department?: string;
  jobTitle?: string;
  email?: string;
  password?: string;
}

export interface SetStatusPayload {
  id: string;
  active: boolean;
}
