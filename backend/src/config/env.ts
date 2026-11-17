const requireEnv = (...keys: string[]) => (env: Record<string, unknown>) => {
  for (const key of keys) {
    if (!env[key]) throw new Error(`Env ${key} wajib diisi`);
  }
  if (env.JWT_SECRET && String(env.JWT_SECRET).length < 32) throw new Error('JWT_SECRET minimal 32 karakter');
  if (env.INTERNAL_SECRET && String(env.INTERNAL_SECRET).length < 16) throw new Error('INTERNAL_SECRET minimal 16 karakter');
  return env;
};

export const gatewayEnv = requireEnv('JWT_SECRET', 'INTERNAL_SECRET');
export const identityEnv = requireEnv('IDENTITY_DB_USER', 'IDENTITY_DB_PASSWORD', 'IDENTITY_DB_NAME', 'INTERNAL_SECRET');
export const attendanceEnv = requireEnv('ATTENDANCE_DB_USER', 'ATTENDANCE_DB_PASSWORD', 'ATTENDANCE_DB_NAME', 'INTERNAL_SECRET');