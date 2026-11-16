export class ApiError extends Error {
  public status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let onUnauthorized: (() => void) | undefined

export function setUnauthorizedHandler(fn?: () => void) {
  onUnauthorized = fn
}

type Options = Omit<RequestInit, 'body'> & { json?: unknown; body?: BodyInit }

export async function http<T>(path: string, { json, headers, ...init }: Options = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...init,
    headers: { ...(json !== undefined && { 'Content-Type': 'application/json' }), ...headers },
    body: json !== undefined ? JSON.stringify(json) : init.body,
  })
  if (!res.ok) {
    // /auth/* (login, me, logout) menangani 401-nya sendiri
    if (res.status === 401 && !path.startsWith('/auth/')) onUnauthorized?.()
    const data = await res.json().catch(() => null)
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
    throw new ApiError(res.status, msg ?? 'Terjadi kesalahan, coba lagi')
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}