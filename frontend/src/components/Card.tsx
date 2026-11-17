import type { ReactNode } from 'react'

interface Props {
  className?: string
  children: ReactNode
}

export default function Card({ className = '', children }: Props) {
  return (
    <section
      className={`relative w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-8 ${className}`}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-dexa-700 via-dexa-400 to-dexa-orange" />
      {children}
    </section>
  )
}