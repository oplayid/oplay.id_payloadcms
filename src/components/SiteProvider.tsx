'use client'

import React, { createContext, useContext } from 'react'
import { siteHref, type Locale } from '@/lib/urls'

export type SiteContextValue = {
  basePath: string
  locale: Locale
}

const SiteContext = createContext<SiteContextValue>({
  basePath: '',
  locale: 'id',
})

export function SiteProvider({
  value,
  children,
}: {
  value: SiteContextValue
  children: React.ReactNode
}) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite(): SiteContextValue & {
  href: (href: string | undefined | null) => string
} {
  const value = useContext(SiteContext)

  return {
    ...value,
    href: (href) => siteHref(href, value.basePath, value.locale),
  }
}
