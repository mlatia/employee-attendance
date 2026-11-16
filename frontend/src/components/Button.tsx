import type { ButtonHTMLAttributes } from 'react'

export default function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-[46px] w-full cursor-pointer rounded-full border border-white bg-transparent text-[16px] font-semibold text-white transition hover:bg-white hover:text-dexa-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  )
}