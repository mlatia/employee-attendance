import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  trailing?: ReactNode
}

export default function Field({ label, trailing, id, ...props }: Props) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        placeholder={label}
        {...props}
        className="w-full border-0 border-b border-white/90 bg-transparent px-3 py-3 text-[17px] text-white outline-none transition placeholder:text-white focus:border-b-2 focus:pb-[11px]"
      />
      {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  )
}