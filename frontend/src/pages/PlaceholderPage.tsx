import { useAuth } from '../auth/AuthContext'

export default function PlaceholderPage({ title }: { title: string }) {
  const { user, logout } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-dexa-700">{title}</h1>
      <p className="mt-2">Login sebagai {user?.fullName} ({user?.role})</p>
      <button onClick={logout} className="mt-4 cursor-pointer rounded-full border border-dexa-700 px-5 py-2 text-dexa-700">
        Keluar
      </button>
    </div>
  )
}