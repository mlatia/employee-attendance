import type { User } from '../types'
import { http } from './http'

export const authApi = {
  login: (email: string, password: string) =>
    http<User>('/auth/login', { method: 'POST', json: { email, password } }),
  me: () => http<User>('/auth/me'),
  logout: () => http<void>('/auth/logout', { method: 'POST' }),
}