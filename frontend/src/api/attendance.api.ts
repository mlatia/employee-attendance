import type { AttendanceRecord, Challenge, ListAttendanceParams, Paginated, TodayAttendance } from '../types'
import { http } from './http'

export const attendanceApi = {
  today: () => http<TodayAttendance>('/attendance/today'),
  challenge: () => http<Challenge>('/attendance/challenge', { method: 'POST' }),
  list: ({ page, limit, date, q }: ListAttendanceParams) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (date) params.set('date', date)
    if (q) params.set('q', q)
    return http<Paginated<AttendanceRecord>>(`/attendance?${params}`)
  },
  photoUrl: (id: string) => `/api/attendance/${id}/photo`,
  submit: (photo: Blob, note: string, idempotencyKey: string, challengeToken?: string | null) => {
    const body = new FormData()
    body.append('photo', photo, 'photo.jpg')
    if (note) body.append('note', note)
    if (challengeToken) body.append('challengeToken', challengeToken)
    // Content-Type multipart + boundary diatur browser, jangan di-set manual
    return http<AttendanceRecord>('/attendance', { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } })
  },
}