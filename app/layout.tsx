import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import GoogleAdsense from '@/components/GoogleAdsense'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Buy vs Rent Calculator | Real Estate vs Stock Market Investment Tool',
  description: 'Free calculator to compare buying a house vs renting and investing in stocks. Analyze mortgage costs, property appreciation, and investment returns to make informed financial decisions.',
  keywords: 'buy vs rent calculator, real estate calculator, mortgage calculator, investment calculator, rent vs buy, property investment, stock market returns',
  authors: [{ name: 'Buy or Invest Calculator' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Buy vs Rent Calculator | Real Estate vs Stock Market Investment Tool',
    description: 'Compare buying real estate vs renting and investing in the stock market. Free financial calculator with comprehensive analysis.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Buy or Invest Calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy vs Rent Calculator | Real Estate vs Stock Market Investment Tool',
    description: 'Compare buying real estate vs renting and investing in the stock market. Free financial calculator with comprehensive analysis.',
  },
  alternates: {
    canonical: 'https://buyvsrent.vercel.app', // Will update to custom domain later
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <GoogleAdsense ADSENSE_CLIENT_ID={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} />
        )}
      </body>
    </html>
  )
}