'use client'

import { createContext, useContext } from 'react'

export type PublicSettings = {
  whatsapp_number: string
}

const SettingsContext = createContext<PublicSettings>({ whatsapp_number: '' })

export function SettingsProvider({
  settings,
  children,
}: {
  settings: PublicSettings
  children: React.ReactNode
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

export function usePublicSettings(): PublicSettings {
  return useContext(SettingsContext)
}
