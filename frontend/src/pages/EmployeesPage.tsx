import { useCallback, useEffect, useState } from 'react'
import { employeesApi } from '../api/employees.api'
import { useAuth } from '../auth/AuthContext'
import AppLayout from '../components/AppLayout'
import ConfirmDialog from '../components/ConfirmDialog'
import EmployeeForm from '../components/EmployeeForm'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import Table, { type Column } from '../components/Table'
import type { CreateEmployeeInput, Employee, Paginated } from '../types'

const PAGE_SIZE = 10

const baseColumns: Column<Employee>[] = [
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

const actionBtn =
  'cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40'

interface Result {
  key: string
  data?: Paginated<Employee>
  error?: string
}

export default function EmployeesPage() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [modal, setModal] = useState<{ employee?: Employee } | null>(null)
  const [statusTarget, setStatusTarget] = useState<Employee | null>(null)
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

  const closeModal = useCallback(() => setModal(null), [])
  const closeStatus = useCallback(() => setStatusTarget(null), [])

  async function handleSave(values: CreateEmployeeInput) {
    const editing = modal?.employee
    if (editing) {
      const { fullName, department, jobTitle, email, password } = values
      const updated = await employeesApi.update(editing.id, {
        fullName,
        department,
        jobTitle,
        email,
        password: password || undefined,
      })
      setNotice(`Data ${updated.fullName} berhasil diperbarui`)
    } else {
      const created = await employeesApi.create(values)
      setNotice(`Karyawan ${created.fullName} berhasil ditambahkan`)
      setPage(1)
    }
    setModal(null)
    setReload((n) => n + 1)
  }

  async function handleToggleStatus() {
    if (!statusTarget) return
    const updated = await employeesApi.setStatus(statusTarget.id, !statusTarget.active)
    setNotice(`Akun ${updated.fullName} ${updated.active ? 'diaktifkan kembali' : 'dinonaktifkan'}`)
    setStatusTarget(null)
    setReload((n) => n + 1)
  }

  const columns: Column<Employee>[] = [
    ...baseColumns,
    {
      key: 'actions',
      header: 'Aksi',
      render: (e) => {
        const isSelf = e.id === user?.id
        return (
          <div className="flex gap-2 whitespace-nowrap">
            <button
              onClick={() => {
                setNotice('')
                setModal({ employee: e })
              }}
              className={`${actionBtn} border-neutral-300 hover:bg-neutral-100`}
            >
              Ubah
            </button>
            <button
              disabled={isSelf}
              title={isSelf ? 'Tidak dapat menonaktifkan akun sendiri' : undefined}
              onClick={() => {
                setNotice('')
                setStatusTarget(e)
              }}
              className={`${actionBtn} ${
                e.active
                  ? 'border-dexa-700 text-dexa-700 hover:bg-dexa-700 hover:text-white'
                  : 'border-green-700 text-green-800 hover:bg-green-700 hover:text-white'
              } disabled:hover:bg-transparent`}
            >
              {e.active ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        )
      },
    },
  ]

  const data = result.data
  const editing = modal?.employee

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-dexa-700">Data Karyawan</h1>
        <button
          onClick={() => {
            setNotice('')
            setModal({})
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
      <Pagination page={page} limit={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} label="karyawan" />

      <Modal open={modal !== null} title={editing ? 'Ubah Karyawan' : 'Tambah Karyawan'} onClose={closeModal}>
        <EmployeeForm
          key={editing?.id ?? 'new'}
          employee={editing}
          isSelf={editing?.id === user?.id}
          onSubmit={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
        message={
          statusTarget?.active
            ? `Nonaktifkan akun ${statusTarget.fullName}? Karyawan tidak bisa login dan semua sesi yang sedang aktif langsung dicabut.`
            : `Aktifkan kembali akun ${statusTarget?.fullName}? Karyawan bisa login lagi dengan password yang sama.`
        }
        confirmLabel={statusTarget?.active ? 'Nonaktifkan' : 'Aktifkan'}
        danger={!!statusTarget?.active}
        onConfirm={handleToggleStatus}
        onCancel={closeStatus}
      />
    </AppLayout>
  )
}