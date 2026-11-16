import { useState, type SubmitEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/http'
import { homePath, useAuth } from '../auth/AuthContext'
import BrandFooter from '../components/BrandFooter'
import BrandHeader from '../components/BrandHeader'
import Button from '../components/Button'
import Field from '../components/Field'

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to={homePath(user.role)} replace />

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const u = await login(email, password)
      navigate(homePath(u.role), { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Terlalu banyak percobaan. Coba lagi sebentar lagi.'
          : err instanceof ApiError
            ? err.message
            : 'Tidak dapat terhubung ke server',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader />

      <main className="flex flex-1 items-center bg-white py-12">
        <div className="mx-auto grid w-full max-w-[1180px] items-center gap-12 px-6 lg:grid-cols-2">
          <section>
            <h1 className="text-5xl font-bold leading-[1.15] text-dexa-700 md:text-[72px]">
              Absensi<br />WFH
            </h1>
            <p className="mt-3 text-xl text-dexa-ink md:text-[28px]">Presisi • Integritas • Skala</p>
          </section>

          <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-[460px] space-y-6 rounded-xl bg-dexa-700 p-8 shadow-2xl md:p-10">
            <h2 className="text-2xl font-bold text-white">Masuk</h2>

            <Field id="email" type="email" label="Email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Field
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              trailing={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="cursor-pointer px-2 text-sm text-white/90 underline">
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              }
            />

            {error && (
              <p role="alert" className="rounded-md bg-black/25 px-3 py-2 text-sm text-white">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting || !email || !password}>
              {submitting ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>
        </div>
      </main>

      <BrandFooter />
    </div>
  )
}