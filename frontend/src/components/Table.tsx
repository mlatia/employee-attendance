import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyText?: string
}

export default function Table<T>({ columns, rows, rowKey, loading, emptyText = 'Tidak ada data' }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-dexa-700 text-white">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`whitespace-nowrap px-4 py-3 font-semibold ${c.className ?? ''}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className={loading ? 'opacity-50 transition' : 'transition'}>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-neutral-500">
                {loading ? 'Memuat…' : emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="border-t border-neutral-100 hover:bg-neutral-50">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>{c.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}