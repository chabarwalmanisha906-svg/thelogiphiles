import type { Metadata } from 'next'
import { Montserrat, Manrope, Caveat } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { CustomCursor } from '@/components/CustomCursor'
import { FallingPencil } from '@/components/FallingPencil'
import { getSiteSettings } from '@/lib/data'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: ['500', '600'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = settings.defaultSeoTitle || 'The Logiphiles | Advertising Writing & Brand Communication'
  const description =
    settings.defaultSeoDescription ||
    'The Logiphiles is an advertising writing and communication agency creating brand copy, campaigns, content and multilingual communication.'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: '%s | The Logiphiles',
    },
    description,
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: 'The Logiphiles',
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" className={`${montserrat.variable} ${manrope.variable} ${caveat.variable}`}>
      <body className="min-h-full bg-offwhite text-navy antialiased">
        <CustomCursor />
        <FallingPencil />
        <Nav />
        <main>{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
