import React from "react"
import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { OfflineDetector } from '@/components/offline-detector'
import { PWAInstaller } from '@/components/pwa-installer'
import './globals.css'

const _playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });
const _lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Enchipai Mara Camp | Luxury Safari Experience in Masai Mara',
  description: 'Experience exclusive luxury safari at Enchipai Camp, a 5-tent boutique camp hidden under the indigenous canopy of the Esoit Oloololo escarpment with breathtaking views of the Masai Mara.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  themeColor: '#1a1a1a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Enchipai Admin',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Enchipai Admin" />
      </head>
      <body className={`${_playfair.variable} ${_lato.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <ServiceWorkerRegister />
        <OfflineDetector />
        <PWAInstaller />
        <Analytics />
      </body>
    </html>
  )
}
