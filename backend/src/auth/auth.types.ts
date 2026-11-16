import type { Role } from '../common/role.enum';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  employeeNo: string;
}

export interface JwtPayload {
  sub: string;
  av: number;
}