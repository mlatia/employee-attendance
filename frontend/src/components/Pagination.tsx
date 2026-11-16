interface Props {
  page: number
  limit: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ page, limit, total, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)

  const btn = 'min-w-9 cursor-pointer rounded-md border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
      <p className="text-neutral-600">
        Menampilkan {from}–{to} dari {total} karyawan
      </p>
      <div className="flex items-center gap-1">
        <button className={`${btn} border-neutral-300 hover:bg-neutral-100`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Sebelumnya
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${btn} ${p === page ? 'border-dexa-700 bg-dexa-700 text-white' : 'border-neutral-300 hover:bg-neutral-100'}`}
          >
            {p}
          </button>
        ))}
        <button className={`${btn} border-neutral-300 hover:bg-neutral-100`} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Berikutnya
        </button>
      </div>
    </div>
  )
}