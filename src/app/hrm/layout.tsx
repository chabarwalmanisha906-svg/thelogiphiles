import type { Metadata } from 'next'
import { Montserrat, Manrope, Caveat } from 'next/font/google'
import '../(frontend)/globals.css'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: ['500'],
})

export const metadata: Metadata = {
  title: 'HRM | The Logiphiles',
  robots: { index: false, follow: false },
}

export default function HrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${manrope.variable} ${caveat.variable}`}>
      <body className="min-h-full bg-offwhite text-navy antialiased">{children}</body>
    </html>
  )
}
