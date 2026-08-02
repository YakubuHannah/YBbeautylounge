/** `0803…`, `+234803…`, `234803…`, spaced variants → one canonical form (2348…). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0') && digits.length === 11) return `234${digits.slice(1)}`
  if (digits.length === 10) return `234${digits}`
  return digits
}

export function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `YB-${stamp}${rand}`
}
