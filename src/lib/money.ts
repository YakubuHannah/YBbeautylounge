/** Money is stored in kobo integers. Never use floats. */
export function formatNaira(kobo: number): string {
  return `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`
}

export function koboFromNaira(naira: number): number {
  return Math.round(naira * 100)
}
