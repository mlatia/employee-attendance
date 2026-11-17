import type { AttendanceRecord, TodayAttendance } from '../types'
import { http } from './http'

export const attendanceApi = {
  today: () => http<TodayAttendance>('/attendance/today'),
  submit: (photo: Blob, note: string, idempotencyKey: string) => {
    const body = new FormData()
    body.append('photo', photo, 'photo.jpg')
    if (note) body.append('note', note)
    return http<AttendanceRecord>('/attendance', { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } })
  },
}