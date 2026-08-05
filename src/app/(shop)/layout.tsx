import { CartProvider } from '@/components/cart/cart-provider'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { WhatsAppFloat } from '@/components/layout/whatsapp-float'
import { SettingsProvider } from '@/components/settings/settings-provider'
import { getSettingValue, getWhatsAppNumber } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [whatsappNumber, announcementText] = await Promise.all([
    getWhatsAppNumber(),
    getSettingValue('announcement_text'),
  ])
  return (
    <SettingsProvider settings={{ whatsapp_number: whatsappNumber }}>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <AnnouncementBar text={announcementText} />
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter whatsappNumber={whatsappNumber} />
          <WhatsAppFloat number={whatsappNumber} />
        </div>
      </CartProvider>
    </SettingsProvider>
  )
}
