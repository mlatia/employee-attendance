import { useEffect, useState } from 'react'

interface Props {
  onSearch: (value: string) => void
  placeholder?: string
  delay?: number
}

export default function SearchInput({ onSearch, placeholder = 'Cari…', delay = 400 }: Props) {
  const [text, setText] = useState('')

  useEffect(() => {
    const t = setTimeout(() => onSearch(text.trim()), delay)
    return () => clearTimeout(t)
  }, [text, delay, onSearch])

  return (
    <input
      type="search"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-[15px] outline-none transition focus:border-dexa-600 focus:ring-2 focus:ring-dexa-600/20 sm:w-80"
    />
  )
}