import { useState } from 'react'
import { attendanceApi } from '../api/attendance.api'
import { formatWib, formatWorkDate } from '../lib/format'
import type { AttendanceRecord } from '../types'
import Modal from './Modal'
import SourceBadge from './SourceBadge'
import Table, { type Column } from './Table'

interface Props {
  rows: AttendanceRecord[]
  loading: boolean
  emptyText: string
  showEmployee?: boolean
}

export default function AttendanceTable({ rows, loading, emptyText, showEmployee = false }: Props) {
  const [viewing, setViewing] = useState<AttendanceRecord | null>(null)
  const [photoState, setPhotoState] = useState<'loading' | 'ready' | 'error'>('loading')

  const columns: Column<AttendanceRecord>[] = [
    { key: 'date', header: 'Tanggal', render: (r) => formatWorkDate(r.workDate, 'medium'), className: 'whitespace-nowrap' },
    { key: 'time', header: 'Jam (WIB)', render: (r) => formatWib(r.submittedAt, { timeStyle: 'medium' }), className: 'whitespace-nowrap tabular-nums' },
    ...(showEmployee
      ? ([
          { key: 'no', header: 'No. Karyawan', render: (r) => r.employeeNo, className: 'whitespace-nowrap font-semibold' },
          { key: 'name', header: 'Nama', render: (r) => r.fullName },
          { key: 'dept', header: 'Departemen', render: (r) => r.department },
        ] as Column<AttendanceRecord>[])
      : []),
    { key: 'note', header: 'Catatan', render: (r) => r.note || '-', className: 'max-w-[240px] truncate' },
    { key: 'source', header: 'Foto dari', render: (r) => <SourceBadge source={r.source} /> },
    {
      key: 'photo',
      header: 'Foto',
      render: (r) => (
        <button
          onClick={() => {
            setPhotoState('loading')
            setViewing(r)
          }}
          className="cursor-pointer font-semibold text-dexa-700 underline"
        >
          Lihat
        </button>
      ),
    },
  ]

  return (
    <>
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} emptyText={emptyText} />
      <Modal open={!!viewing} title={viewing ? `${viewing.fullName} · ${formatWorkDate(viewing.workDate, 'medium')}` : ''} onClose={() => setViewing(null)}>
        {viewing && (
          <div className="min-h-40">
            {photoState === 'loading' && <p className="py-10 text-center text-sm text-neutral-500">Memuat foto…</p>}
            {photoState === 'error' && <p className="py-10 text-center text-sm text-dexa-700">Foto tidak dapat dimuat</p>}
            <img
              src={attendanceApi.photoUrl(viewing.id)}
              alt={`Foto bukti ${viewing.fullName}`}
              onLoad={() => setPhotoState('ready')}
              onError={() => setPhotoState('error')}
              className={photoState === 'ready' ? 'w-full rounded-lg' : 'hidden'}
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <SourceBadge source={viewing.source} />
              <span className="text-neutral-500">{formatWib(viewing.submittedAt, { dateStyle: 'medium', timeStyle: 'medium' })} WIB</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}