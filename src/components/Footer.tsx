import Image from 'next/image'
import Link from 'next/link'
import { Logo } from './Logo'
import type { SiteSettings } from '@/lib/data'

type SocialKey = 'instagramUrl' | 'youtubeUrl' | 'twitterUrl' | 'facebookUrl' | 'linkedinUrl'

const FOOTER_COLUMNS: { label: string; href: string; socialLabel: string; socialKey: SocialKey }[] = [
  { label: 'Who We Are', href: '/#who-we-are', socialLabel: 'INSTAGRAM', socialKey: 'instagramUrl' },
  { label: 'What We Do', href: '/#what-we-do', socialLabel: 'YOUTUBE', socialKey: 'youtubeUrl' },
  { label: 'Work', href: '/work', socialLabel: 'TWITTER', socialKey: 'twitterUrl' },
  { label: 'Insights', href: '/insights', socialLabel: 'FACEBOOK', socialKey: 'facebookUrl' },
  { label: 'Contact', href: '/#contact', socialLabel: 'LINKEDIN', socialKey: 'linkedinUrl' },
]

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy px-6 pb-10 pt-20 text-white md:px-10">
      <div className="relative mx-auto max-w-[1600px]">
        <div className="flex flex-col items-center justify-between gap-10 border-b border-white/15 pb-14 md:flex-row md:items-end md:gap-6">
          <div>
            <Logo variant="light" className="mb-8" tagline="Copywriting agency" />
            <p className="font-heading text-2xl font-extrabold leading-[1.1] tracking-tight md:text-4xl">
              YES, YOU ARE RIGHT;
              <br />
              <span className="text-mint">WE WRITE.</span>
            </p>
          </div>

          <div className="grid grid-cols-5 gap-x-8 gap-y-5 text-center md:text-left">
            {FOOTER_COLUMNS.map((col) => (
              <Link
                key={col.label}
                href={col.href}
                className="font-heading text-[13px] font-semibold tracking-[0.08em] text-white/80 transition-colors hover:text-mint"
              >
                {col.label.toUpperCase()}
              </Link>
            ))}

            <div className="col-span-5 h-px bg-white/15" />

            {FOOTER_COLUMNS.map((col) => (
              <a
                key={col.socialKey}
                href={settings[col.socialKey] || '#'}
                target={settings[col.socialKey] ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="font-heading text-[13px] font-semibold tracking-[0.08em] text-white/80 transition-colors hover:text-mint"
              >
                {col.socialLabel}
              </a>
            ))}
          </div>

          <Image
            id="footer-merch-cup"
            src="/footer-merch.png"
            alt="A Logiphiles branded desk cup holding pens and a pencil"
            width={647}
            height={984}
            unoptimized
            className="h-28 w-auto shrink-0 drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)] sm:h-36 md:h-44"
          />
        </div>

        <p className="pt-8 text-center font-body text-sm text-white/60 md:text-left">
          © {year} The Logiphiles. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
