import Link from 'next/link'
import { Logo } from './Logo'
import type { SiteSettings } from '@/lib/data'

const FOOTER_LINKS = [
  { label: 'Who We Are', href: '/#who-we-are' },
  { label: 'What We Do', href: '/#what-we-do' },
  { label: 'Work', href: '/work' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/#contact' },
]

type SocialKey = 'instagramUrl' | 'youtubeUrl' | 'twitterUrl' | 'facebookUrl' | 'linkedinUrl'

const SOCIAL_LINKS: { label: string; key: SocialKey }[] = [
  { label: 'INSTAGRAM', key: 'instagramUrl' },
  { label: 'YOUTUBE', key: 'youtubeUrl' },
  { label: 'TWITTER', key: 'twitterUrl' },
  { label: 'FACEBOOK', key: 'facebookUrl' },
  { label: 'LINKEDIN', key: 'linkedinUrl' },
]

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy px-6 pb-10 pt-20 text-white md:px-10">
      <div className="relative mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-14 border-b border-white/15 pb-14 md:flex-row md:items-end">
          <div>
            <Logo variant="light" className="mb-8" />
            <p className="font-heading text-2xl font-extrabold leading-[1.1] tracking-tight md:text-4xl">
              YES, YOU ARE RIGHT.
              <br />
              <span className="text-teal">WE WRITE.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-heading text-[13px] font-semibold tracking-[0.08em] text-white/80 transition-colors hover:text-teal"
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-6 pt-8 md:flex-row md:items-center">
          <p className="font-body text-sm text-white/60">
            © {year} The Logiphiles. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map(({ label, key }) => (
              <a
                key={key}
                href={settings[key] || '#'}
                target={settings[key] ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="font-heading text-[13px] font-semibold tracking-[0.08em] text-white/80 transition-colors hover:text-teal"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
