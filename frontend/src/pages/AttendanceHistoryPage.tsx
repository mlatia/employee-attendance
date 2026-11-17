import { useState } from 'react'
import { attendanceApi } from '../api/attendance.api'
import AppLayout from '../components/AppLayout'
import AttendanceTable from '../components/AttendanceTable'
import Pagination from '../components/Pagination'
import { usePagedList } from '../hooks/usePagedList'

const PAGE_SIZE = 10

export default function AttendanceHistoryPage() {
  const [page, setPage] = useState(1)
  const { data, loading, error } = usePagedList(attendanceApi.list, { page, limit: PAGE_SIZE })

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-dexa-700 sm:text-3xl">Riwayat Absensi</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-600 sm:text-base">Catatan kehadiran WFH Anda.</p>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-dexa-700/10 px-4 py-2 text-sm text-dexa-700">
          {error}
        </p>
      )}

      <AttendanceTable rows={data?.items ?? []} loading={loading} emptyText="Belum ada riwayat absensi" />
      <Pagination page={page} limit={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} label="absensi" />
    </AppLayout>
  )
}