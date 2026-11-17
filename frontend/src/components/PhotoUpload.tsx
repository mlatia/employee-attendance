import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { attendanceApi } from '../api/attendance.api'
import { ApiError } from '../api/http'

const MAX_BYTES = 15 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface Props {
  /** challengeToken hanya terisi untuk foto hasil kamera langsung. */
  onChange: (file: File | null, challengeToken: string | null) => void
  disabled?: boolean
}

function cameraErrorText(err: unknown) {
  if (err instanceof ApiError) return `Sesi kamera tidak dapat dimulai: ${err.message}`
  const name = err instanceof DOMException ? err.name : ''
  if (name === 'NotAllowedError') return 'Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser, atau pilih dari galeri.'
  if (name === 'NotFoundError') return 'Kamera tidak ditemukan. Pilih foto dari galeri.'
  if (name === 'NotReadableError') return 'Kamera sedang dipakai aplikasi lain.'
  return 'Kamera tidak dapat dibuka. Pilih foto dari galeri.'
}

export default function PhotoUpload({ onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const previewRef = useRef('')
  const tokenRef = useRef<string | null>(null)
  const [preview, setPreview] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  // matikan kamera dan bersihkan URL pratinjau saat halaman ditutup
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    },
    [],
  )

  // pasang stream ke <video> setelah elemennya tampil
  useEffect(() => {
    const video = videoRef.current
    if (cameraOn && video && streamRef.current) {
      video.srcObject = streamRef.current
      void video.play().catch(() => undefined)
    }
  }, [cameraOn])

  function select(file: File | null, token: string | null = null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = file ? URL.createObjectURL(file) : ''
    setPreview(previewRef.current)
    onChange(file, token)
  }

  async function openCamera() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      return setError('Browser ini tidak mendukung kamera langsung (butuh HTTPS atau localhost). Pilih dari galeri.')
    }
    setOpening(true)
    try {
      // token diminta saat kamera dibuka: jendela waktu pembuktian mulai dari sini
      const challenge = await attendanceApi.challenge()
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      tokenRef.current = challenge.token
      select(null)
      setCameraOn(true)
    } catch (err) {
      setError(cameraErrorText(err))
    } finally {
      setOpening(false)
    }
  }

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return setError('Kamera belum siap, tunggu sebentar')
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0) // frame asli, tidak dicerminkan
    canvas.toBlob(
      (blob) => {
        if (!blob) return setError('Gagal mengambil foto, coba lagi')
        const token = tokenRef.current
        tokenRef.current = null
        stopCamera()
        select(new File([blob], 'camera.jpg', { type: 'image/jpeg' }), token)
      },
      'image/jpeg',
      0.9,
    )
  }

  function cancelCamera() {
    tokenRef.current = null
    stopCamera()
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
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
    cancelCamera()
    select(file) // foto dari galeri: tanpa token
  }

  const busy = disabled || opening
  const choiceBtn =
    'flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white px-3 text-center text-neutral-500 transition hover:border-dexa-600 hover:text-dexa-700 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">Foto Bukti WFH</span>

      {cameraOn ? (
        <div className="overflow-hidden rounded-xl border border-neutral-300 bg-black">
          {/* pratinjau dicerminkan seperti cermin, hasil jepretan tetap normal */}
          <video ref={videoRef} playsInline muted autoPlay className="max-h-80 w-full object-contain" style={{ transform: 'scaleX(-1)' }} />
          <div className="flex gap-2 bg-white p-3">
            <button
              type="button"
              onClick={capture}
              disabled={disabled}
              className="h-10 flex-1 cursor-pointer rounded-full bg-dexa-700 text-sm font-semibold text-white transition hover:bg-dexa-600 disabled:opacity-60"
            >
              Ambil Foto
            </button>
            <button
              type="button"
              onClick={cancelCamera}
              className="h-10 cursor-pointer rounded-full border border-neutral-300 px-5 text-sm font-semibold transition hover:bg-neutral-100"
            >
              Batal
            </button>
          </div>
        </div>
      ) : preview ? (
        <div className="overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100">
          <img src={preview} alt="Pratinjau foto bukti" className="max-h-80 w-full object-contain" />
          <div className="flex justify-end gap-4 border-t border-neutral-200 bg-white p-2">
            <button type="button" disabled={busy} onClick={openCamera} className="cursor-pointer text-sm font-semibold text-dexa-700 underline disabled:opacity-50">
              Foto ulang
            </button>
            <button type="button" disabled={busy} onClick={() => select(null)} className="cursor-pointer text-sm font-semibold text-neutral-600 underline disabled:opacity-50">
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={busy} onClick={openCamera} className={choiceBtn}>
            <span className="text-3xl leading-none">📷</span>
            <span className="mt-2 text-sm font-semibold">{opening ? 'Membuka kamera…' : 'Buka Kamera'}</span>
            <span className="text-xs">Ambil foto langsung (terverifikasi)</span>
          </button>
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={choiceBtn}>
            <span className="text-3xl leading-none">🖼️</span>
            <span className="mt-2 text-sm font-semibold">Pilih dari Galeri</span>
            <span className="text-xs">JPEG, PNG, atau WebP</span>
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept={TYPES.join(',')} onChange={handleFile} className="hidden" />

      {error && (
        <p role="alert" className="mt-2 text-sm text-dexa-700">
          {error}
        </p>
      )}
    </div>
  )
}