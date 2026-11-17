import { useState, type FormEvent } from 'react'
import type { CreateEmployeeInput, Employee, Role } from '../types'
import FormField from './FormField'

interface Props {
  employee?: Employee
  isSelf?: boolean
  onSubmit: (input: CreateEmployeeInput) => Promise<void>
  onCancel: () => void
}

const EMPTY: CreateEmployeeInput = {
  employeeNo: '',
  fullName: '',
  department: '',
  jobTitle: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
}

const initialValues = (e?: Employee): CreateEmployeeInput =>
  e
    ? {
        employeeNo: e.employeeNo,
        fullName: e.fullName,
        department: e.department,
        jobTitle: e.jobTitle,
        email: e.email,
        password: '',
        role: e.role,
      }
    : EMPTY

export default function EmployeeForm({ employee, isSelf = false, onSubmit, onCancel }: Props) {
  const isEdit = !!employee
  const [form, setForm] = useState<CreateEmployeeInput>(() => initialValues(employee))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // HRD tidak mereset password akunnya sendiri dari sini (sesinya akan ikut tercabut)
  const showPasswordField = !isEdit || !isSelf

  const set = <K extends keyof CreateEmployeeInput>(key: K, value: CreateEmployeeInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const values = [form.employeeNo, form.fullName, form.department, form.jobTitle, form.email].map((v) => v.trim())
    if (values.some((v) => !v)) return setError('Semua kolom wajib diisi')
    if ((!isEdit || form.password) && form.password.length < 8) return setError('Password minimal 8 karakter')

    setSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="employeeNo"
          label="Nomor Karyawan"
          value={form.employeeNo}
          onChange={(e) => set('employeeNo', e.target.value)}
          maxLength={30}
          disabled={isEdit}
          required
        />
        <FormField id="fullName" label="Nama Lengkap" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} maxLength={100} required />
        <FormField id="department" label="Departemen" value={form.department} onChange={(e) => set('department', e.target.value)} maxLength={80} required />
        <FormField id="jobTitle" label="Jabatan" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} maxLength={80} required />
      </div>

      <FormField id="email" type="email" label="Email (untuk login)" autoComplete="off" value={form.email} onChange={(e) => set('email', e.target.value)} maxLength={254} required />

      {showPasswordField && (
        <FormField
          id="password"
          type={showPassword ? 'text' : 'password'}
          label={isEdit ? 'Password Baru (opsional)' : 'Password Awal'}
          hint={
            isEdit
              ? 'Kosongkan jika tidak diubah. Jika diisi, semua sesi login karyawan ini dicabut.'
              : 'Minimal 8 karakter. Berikan ke karyawan secara langsung.'
          }
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          maxLength={128}
          required={!isEdit}
          trailing={
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="cursor-pointer px-2 text-sm text-dexa-700 underline">
              {showPassword ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          }
        />
      )}

      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-semibold">Role</label>
        <select
          id="role"
          value={form.role}
          onChange={(e) => set('role', e.target.value as Role)}
          disabled={isEdit}
          title={isEdit ? 'Role tidak dapat diubah setelah akun dibuat' : undefined}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[15px] outline-none focus:border-dexa-600 focus:ring-2 focus:ring-dexa-600/20 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
        >
          <option value="EMPLOYEE">Karyawan</option>
          <option value="HRD">HRD</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-dexa-700/10 px-3 py-2 text-sm text-dexa-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={submitting} className="cursor-pointer rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:opacity-60">
          Batal
        </button>
        <button type="submit" disabled={submitting} className="cursor-pointer rounded-full bg-dexa-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-dexa-600 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}