const REQUIRED = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];

export function validateEnv(env: Record<string, unknown>) {
  for (const key of REQUIRED) {
    if (!env[key]) throw new Error(`Env ${key} wajib diisi`);
  }
  if (typeof env.JWT_SECRET !== 'string' || env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET minimal 32 karakter');
  return env;
}