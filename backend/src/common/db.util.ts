export const isDuplicateEntry = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && (e as { code?: string }).code === 'ER_DUP_ENTRY';