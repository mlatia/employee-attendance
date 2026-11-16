const REQUIRED = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'INTERNAL_SECRET'];

export function validateEnv(env: Record<string, unknown>) {
  for (const key of REQUIRED) {
    if (!env[key]) throw new Error(`Env ${key} wajib diisi`);
  }
  if (String(env.JWT_SECRET).length < 32) throw new Error('JWT_SECRET minimal 32 karakter');
  if (String(env.INTERNAL_SECRET).length < 16) throw new Error('INTERNAL_SECRET minimal 16 karakter');
  return env;
}