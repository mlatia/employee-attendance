export const ATTENDANCE_SERVICE = 'ATTENDANCE_SERVICE';

export const ATTENDANCE_PATTERNS = {
  submit: 'attendance.submit',
  today: 'attendance.today',
} as const;

export interface SubmitPayload {
  note?: string;
  photo: string;
  idempotencyKey: string;
}

export interface AttendanceView {
  id: string;
  workDate: string;
  submittedAt: string; 
  fullName: string;
  employeeNo: string;
  department: string;
  note: string;
}

export interface TodayView {
  workDate: string;
  record: AttendanceView | null;
}