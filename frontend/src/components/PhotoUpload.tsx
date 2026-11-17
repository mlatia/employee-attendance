import { useEffect, useRef, useState, type ChangeEvent } from 'react'

const MAX_BYTES = 15 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface Props {
  onChange: (file: File | null) => void
  disabled?: boolean
}

export default function PhotoUpload({ onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef('')
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  function select(file: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = file ? URL.createObjectURL(file) : ''
    setPreview(previewRef.current)
    onChange(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // supaya memilih file yang sama lagi tetap memicu event
    if (!file) return
    if (!TYPES.includes(file.type)) {
      setError('Format harus JPEG, PNG, atau WebP')
      return select(null)
    }
    if (file.size > MAX_BYTES) {
      setError('Ukuran foto maksimal 15 MB')
      return select(null)
    }
    setError('')
    select(file)
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">Foto Bukti WFH</span>
      {preview ? (
        <div className="overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100">
          <img src={preview} alt="Pratinjau foto bukti" className="max-h-80 w-full object-contain" />
          <div className="border-t border-neutral-200 bg-white p-2 text-right">
            <button
              type="button"
              disabled={disabled}
              onClick={() => select(null)}
              className="cursor-pointer text-sm font-semibold text-dexa-700 underline disabled:opacity-50"
            >
              Ganti foto
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white text-neutral-500 transition hover:border-dexa-600 hover:text-dexa-700 disabled:opacity-50"
        >
          <span className="text-3xl leading-none">📷</span>
          <span className="mt-2 text-sm font-semibold">Pilih atau ambil foto</span>
          <span className="text-xs">JPEG, PNG, atau WebP</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={TYPES.join(',')} onChange={handleChange} className="hidden" />
      {error && (
        <p role="alert" className="mt-2 text-sm text-dexa-700">
          {error}
        </p>
      )}
    </div>
  )
}