export const formatWib = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', ...options })

export const formatWorkDate = (workDate: string) =>
  formatWib(`${workDate}T00:00:00+07:00`, { dateStyle: 'full' })