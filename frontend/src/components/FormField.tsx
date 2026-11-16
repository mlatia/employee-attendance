import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  trailing?: ReactNode
}

export default function FormField({ label, hint, trailing, id, ...props }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <input
          id={id}
          {...props}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[15px] outline-none transition focus:border-dexa-600 focus:ring-2 focus:ring-dexa-600/20"
        />
        {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  )
}