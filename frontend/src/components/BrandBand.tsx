import type { ReactNode } from 'react'

const SHAPES = [
  { cls: 'left-[30%] right-0 bg-dexa-400', clip: 'polygon(7% 0,100% 0,100% 100%,0 100%)' },
  { cls: 'left-[52%] w-[26%] bg-dexa-500', clip: 'polygon(0 0,100% 0,62% 100%,18% 100%)' },
  { cls: 'left-[54%] w-[14%] bg-dexa-orange', clip: 'polygon(0 0,100% 0,52% 100%)' },
  { cls: 'right-0 w-[12%] bg-dexa-600/90', clip: 'polygon(35% 0,100% 0,100% 100%,0 100%)' },
]

export default function BrandBand({ className = '', children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={`relative overflow-hidden bg-dexa-600 ${className}`}>
      {SHAPES.map((s, i) => (
        <div key={i} aria-hidden className={`absolute inset-y-0 ${s.cls}`} style={{ clipPath: s.clip }} />
      ))}
      <div className="relative mx-auto flex h-full w-full max-w-[1180px] items-center px-6">{children}</div>
    </div>
  )
}