import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import BrandFooter from './BrandFooter'
import BrandHeader from './BrandHeader'

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_15%_0%,#ffffff_0%,#f3f3f4_55%,#e6e6e8_100%)]">
      <BrandHeader />
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm sm:px-6">
          <span className="min-w-0 truncate">
            {user?.fullName} <span className="text-neutral-500">({user?.role === 'HRD' ? 'HRD' : 'Karyawan'})</span>
          </span>
          <button
            onClick={logout}
            className="cursor-pointer rounded-full border border-dexa-700 px-4 py-1.5 font-semibold text-dexa-700 transition hover:bg-dexa-700 hover:text-white"
          >
            Keluar
          </button>
        </div>
      </div>
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      <BrandFooter />
    </div>
  )
}