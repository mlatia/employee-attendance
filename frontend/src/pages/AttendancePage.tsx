import { useCallback, useEffect, useRef, useState, type SubmitEvent } from 'react'
import { ApiError } from '../api/http'
import { attendanceApi } from '../api/attendance.api'
import { useAuth } from '../auth/AuthContext'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import PhotoUpload from '../components/PhotoUpload'
import { formatWib, formatWorkDate } from '../lib/format'
import { resizeToJpeg } from '../lib/image'
import type { AttendanceRecord, TodayAttendance } from '../types'

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Terjadi kesalahan, coba lagi')

function InfoItem({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-0.5 break-words font-semibold text-dexa-ink">{value}</dd>
    </div>
  )
}

function AttendanceDone({ record }: { record: AttendanceRecord }) {
  return (
    <Card>
      <div className="flex items-start gap-3 sm:items-center">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dexa-700 text-lg text-white">
          ✓
        </span>
        <div>
          <h2 className="text-lg font-bold text-dexa-700 sm:text-xl">Absensi hari ini sudah tercatat</h2>
          <p className="text-sm text-neutral-500">Terima kasih, data kehadiran Anda sudah tersimpan.</p>
        </div>
      </div>

      <p className="mt-6 text-4xl font-bold tabular-nums text-dexa-ink sm:text-5xl">
        {formatWib(record.submittedAt, { timeStyle: 'medium' })}
        <span className="ml-2 text-base font-semibold text-neutral-500">WIB</span>
      </p>

      <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-neutral-200 pt-6 sm:grid-cols-2">
        <InfoItem label="Nama" value={record.fullName} />
        <InfoItem label="No. Karyawan" value={record.employeeNo} />
        <InfoItem label="Departemen" value={record.department} />
        <InfoItem label="Tanggal" value={formatWorkDate(record.workDate)} />
        <InfoItem label="Catatan" value={record.note || '-'} className="sm:col-span-2" />
      </dl>
    </Card>
  )
}

export default function AttendancePage() {
  const { user } = useAuth()
  const [today, setToday] = useState<TodayAttendance | null>(null)
  const [loadError, setLoadError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  // satu "percobaan kirim" = satu Idempotency-Key + satu blob; retry memakai keduanya lagi
  const attempt = useRef<{ key: string; blob: Blob } | null>(null)

  const loadToday = useCallback(
    () => attendanceApi.today().then(setToday).catch((e) => setLoadError(errorText(e))),
    [],
  )

  useEffect(() => {
    void loadToday()
  }, [loadToday])

  function changeFile(next: File | null) {
    attempt.current = null
    setFile(next)
  }

  function changeNote(value: string) {
    attempt.current = null
    setNote(value)
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return setError('Pilih foto bukti terlebih dahulu')
    setError('')
    setSubmitting(true)
    try {
      if (!attempt.current) {
        const blob = await resizeToJpeg(file).catch(() => null)
        if (!blob) return setError('Foto tidak dapat dibaca. Coba foto lain.')
        attempt.current = { key: crypto.randomUUID(), blob }
      }
      const record = await attendanceApi.submit(attempt.current.blob, note.trim(), attempt.current.key)
      setToday((t) => ({ workDate: t?.workDate ?? record.workDate, record }))
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) await loadToday()
      else setError(errorText(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-dexa-700 sm:text-3xl">Absensi WFH</h1>
      <p className="mt-1 text-sm text-neutral-600 sm:text-base">
        Halo, {user?.fullName}.{today && ` ${formatWorkDate(today.workDate)}`}
      </p>

      <div className="mt-6">
        {loadError && (
          <p role="alert" className="mb-4 max-w-2xl rounded-md bg-dexa-700/10 px-4 py-2 text-sm text-dexa-700">
            {loadError}
          </p>
        )}

        {!today && !loadError && <p className="text-neutral-500">Memuat…</p>}

        {today?.record && <AttendanceDone record={today.record} />}

        {today && !today.record && (
          <Card>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <PhotoUpload onChange={changeFile} disabled={submitting} />

              <div>
                <label htmlFor="note" className="mb-1 block text-sm font-semibold">Catatan (opsional)</label>
                <textarea
                  id="note"
                  rows={3}
                  maxLength={500}
                  value={note}
                  onChange={(e) => changeNote(e.target.value)}
                  disabled={submitting}
                  placeholder="Misalnya: mengerjakan laporan bulanan"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-[15px] outline-none focus:border-dexa-600 focus:ring-2 focus:ring-dexa-600/20"
                />
              </div>

              <p className="text-xs text-neutral-500">Tanggal dan jam dicatat otomatis oleh server saat Anda mengirim.</p>

              {error && (
                <p role="alert" className="rounded-md bg-dexa-700/10 px-3 py-2 text-sm text-dexa-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!file || submitting}
                className="h-11 w-full cursor-pointer rounded-full bg-dexa-700 font-semibold text-white transition hover:bg-dexa-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Mengirim…' : 'Kirim Absensi'}
              </button>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}