import { useCallback, useEffect, useState } from 'react'
import { employeesApi } from '../api/employees.api'
import AppLayout from '../components/AppLayout'
import EmployeeForm from '../components/EmployeeForm'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import Table, { type Column } from '../components/Table'
import type { CreateEmployeeInput, Employee, Paginated } from '../types'

const PAGE_SIZE = 10

const columns: Column<Employee>[] = [
  { key: 'employeeNo', header: 'No. Karyawan', render: (e) => e.employeeNo, className: 'whitespace-nowrap font-semibold' },
  { key: 'fullName', header: 'Nama', render: (e) => e.fullName },
  { key: 'department', header: 'Departemen', render: (e) => e.department },
  { key: 'jobTitle', header: 'Jabatan', render: (e) => e.jobTitle },
  { key: 'email', header: 'Email', render: (e) => e.email },
  { key: 'role', header: 'Role', render: (e) => (e.role === 'HRD' ? 'HRD' : 'Karyawan') },
  {
    key: 'active',
    header: 'Status',
    render: (e) => (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.active ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'}`}>
        {e.active ? 'Aktif' : 'Nonaktif'}
      </span>
    ),
  },
]

interface Result {
  key: string
  data?: Paginated<Employee>
  error?: string
}

export default function EmployeesPage() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [result, setResult] = useState<Result>({ key: '' })

  const requestKey = `${q}|${page}|${reload}`
  const loading = result.key !== requestKey

  useEffect(() => {
    let cancelled = false
    employeesApi
      .list({ q, page, limit: PAGE_SIZE })
      .then((data) => !cancelled && setResult({ key: requestKey, data }))
      .catch((err) => !cancelled && setResult({ key: requestKey, error: err instanceof Error ? err.message : 'Gagal memuat data' }))
    return () => {
      cancelled = true
    }
  }, [q, page, requestKey])

  const handleSearch = useCallback((value: string) => {
    setQ(value)
    setPage(1)
  }, [])

  const closeModal = useCallback(() => setModalOpen(false), [])

  async function handleCreate(input: CreateEmployeeInput) {
    const created = await employeesApi.create(input)
    setModalOpen(false)
    setNotice(`Karyawan ${created.fullName} berhasil ditambahkan`)
    setPage(1)
    setReload((n) => n + 1)
  }

  const data = result.data

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-dexa-700">Data Karyawan</h1>
        <button
          onClick={() => {
            setNotice('')
            setModalOpen(true)
          }}
          className="cursor-pointer rounded-full bg-dexa-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-dexa-600"
        >
          + Tambah Karyawan
        </button>
      </div>

      <div className="mb-4">
        <SearchInput onSearch={handleSearch} placeholder="Cari nama, nomor, departemen, jabatan, email" />
      </div>

      {notice && (
        <p role="status" className="mb-4 rounded-md bg-green-100 px-4 py-2 text-sm text-green-800">
          {notice}
        </p>
      )}
      {result.error && !loading && (
        <p role="alert" className="mb-4 rounded-md bg-dexa-700/10 px-4 py-2 text-sm text-dexa-700">
          {result.error}
        </p>
      )}

      <Table
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(e) => e.id}
        loading={loading}
        emptyText={q ? `Tidak ada karyawan yang cocok dengan "${q}"` : 'Belum ada data karyawan'}
      />
      <Pagination page={page} limit={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} />

      <Modal open={modalOpen} title="Tambah Karyawan" onClose={closeModal}>
        <EmployeeForm onSubmit={handleCreate} onCancel={closeModal} />
      </Modal>
    </AppLayout>
  )
}