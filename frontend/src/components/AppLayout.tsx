import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import BrandFooter from './BrandFooter'
import BrandHeader from './BrandHeader'

export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user, logout } = useAuth()
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <BrandHeader />
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3 text-sm">
          <span>
            {user?.fullName} <span className="text-neutral-500">({user?.role})</span>
          </span>
          <button
            onClick={logout}
            className="cursor-pointer rounded-full border border-dexa-700 px-4 py-1.5 font-semibold text-dexa-700 transition hover:bg-dexa-700 hover:text-white"
          >
            Keluar
          </button>
        </div>
      </div>
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-8">{children}</main>
      <BrandFooter />
    </div>
  )
}