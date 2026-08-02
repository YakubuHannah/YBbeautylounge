import { prisma } from '@/lib/prisma'

/** Founder-editable settings (§12). Defaults apply until a row exists. */
export const SETTING_DEFAULTS: Record<string, string> = {
  whatsapp_number: '2349037844700',
}

export async function getSettingValue(key: string): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } })
    if (row && typeof row.value === 'string' && row.value) return row.value
  } catch {
    // fall through to default
  }
  return SETTING_DEFAULTS[key] ?? ''
}

export async function getWhatsAppNumber(): Promise<string> {
  const value = await getSettingValue('whatsapp_number')
  return value.replace(/\D/g, '')
}
