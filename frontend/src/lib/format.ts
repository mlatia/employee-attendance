export const formatWib = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', ...options })

/** workDate dari server berbentuk YYYY-MM-DD (tanggal WIB). */
export const formatWorkDate = (workDate: string, dateStyle: 'full' | 'medium' = 'full') =>
  formatWib(`${workDate}T00:00:00+07:00`, { dateStyle })

/** Tanggal hari ini di WIB (YYYY-MM-DD), dipakai sebagai filter default HRD. */
export const todayWib = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })