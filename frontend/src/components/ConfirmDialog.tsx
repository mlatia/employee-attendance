import { useState } from 'react'
import Modal from './Modal'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, onCancel, ...body }: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <ConfirmBody onCancel={onCancel} {...body} />
    </Modal>
  )
}

// state dipisah ke komponen ini supaya ter-reset tiap dialog dibuka
function ConfirmBody({ message, confirmLabel, danger, onConfirm, onCancel }: Omit<Props, 'open' | 'title'>) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setError('')
    setSubmitting(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-[15px]">{message}</p>
      {error && (
        <p role="alert" className="rounded-md bg-dexa-700/10 px-3 py-2 text-sm text-dexa-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} disabled={submitting} className="cursor-pointer rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold transition hover:bg-neutral-100 disabled:opacity-60">
          Batal
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className={`cursor-pointer rounded-full px-6 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${danger ? 'bg-dexa-700 hover:bg-dexa-600' : 'bg-green-700 hover:bg-green-600'}`}
        >
          {submitting ? 'Memproses…' : confirmLabel}
        </button>
      </div>
    </div>
  )
}