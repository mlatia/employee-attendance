
import type { AttendanceRecord } from '../types'

type SourceBadgeProps = {
  source: AttendanceRecord['source']
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  const isCamera = source === 'CAMERA'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        isCamera
          ? 'bg-green-100 text-green-800'
          : 'bg-neutral-100 text-neutral-700'
      }`}
    >
      {isCamera ? 'Kamera' : 'Upload'}
    </span>
  )
}
