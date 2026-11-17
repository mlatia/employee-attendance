export const ATTENDANCE_SERVICE = 'ATTENDANCE_SERVICE';

export const ATTENDANCE_PATTERNS = {
  submit: 'attendance.submit',
  today: 'attendance.today',
  challenge: 'attendance.challenge',
  list: 'attendance.list',
  photo: 'attendance.photo',
} as const;

export type PhotoSource = 'CAMERA' | 'FILE';

export interface SubmitPayload {
  note?: string;
  photo: string; // base64
  idempotencyKey: string;
  challengeToken?: string;
}

export interface ListPayload {
  page: number;
  limit: number;
  date?: string; // YYYY-MM-DD
  q?: string;
}

export interface AttendanceView {
  id: string;
  workDate: string;
  submittedAt: string; // ISO UTC
  fullName: string;
  employeeNo: string;
  department: string;
  note: string;
  source: PhotoSource;
}

export interface TodayView {
  workDate: string;
  record: AttendanceView | null;
}

export interface ChallengeView {
  token: string;
  expiresAt: string;
}