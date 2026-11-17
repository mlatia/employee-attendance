import { useCallback, useState } from 'react'
import { attendanceApi } from '../api/attendance.api'
import AppLayout from '../components/AppLayout'
import AttendanceTable from '../components/AttendanceTable'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import { todayWib } from '../lib/format'
import { usePagedList } from '../hooks/usePagedList'

const PAGE_SIZE = 10

export default function AttendanceMonitorPage() {
  const [date, setDate] = useState(todayWib)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const { data, loading, error } = usePagedList(attendanceApi.list, {
    page,
    limit: PAGE_SIZE,
    date: date || undefined,
    q: q || undefined,
  })

  const handleSearch = useCallback((value: string) => {
    setQ(value)
    setPage(1)
  }, [])

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-dexa-700 sm:text-3xl">Monitoring Absensi</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-600 sm:text-base">Data absensi yang disubmit karyawan.</p>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-semibold">Tanggal</label>
          <div className="flex items-center gap-2">
            <input
              id="date"
              type="date"
              value={date}
              max={todayWib()}
              onChange={(e) => {
                setDate(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-[15px] outline-none focus:border-dexa-600 focus:ring-2 focus:ring-dexa-600/20"
            />
            <button
              type="button"
              onClick={() => {
                setDate('')
                setPage(1)
              }}
              className="cursor-pointer text-sm font-semibold text-dexa-700 underline"
            >
              Semua tanggal
            </button>
          </div>
        </div>
        <div className="sm:ml-auto">
          <SearchInput onSearch={handleSearch} placeholder="Cari nama atau nomor karyawan" />
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-dexa-700/10 px-4 py-2 text-sm text-dexa-700">
          {error}
        </p>
      )}

      <AttendanceTable
        showEmployee
        rows={data?.items ?? []}
        loading={loading}
        emptyText={date || q ? 'Tidak ada absensi yang cocok dengan filter' : 'Belum ada data absensi'}
      />
      <Pagination page={page} limit={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} label="absensi" />
    </AppLayout>
  )
}