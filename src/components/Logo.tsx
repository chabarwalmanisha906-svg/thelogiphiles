import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  variant?: 'dark' | 'light'
  className?: string
  tagline?: string
}

const ICON_SIZE: Record<NonNullable<LogoProps['variant']>, number> = {
  dark: 34,
  light: 44,
}

const WORDMARK_SIZE: Record<NonNullable<LogoProps['variant']>, string> = {
  dark: 'text-base',
  light: 'text-xl',
}

const TAGLINE_SIZE: Record<NonNullable<LogoProps['variant']>, string> = {
  dark: 'text-[10px]',
  light: 'text-xs',
}

export function Logo({
  variant = 'dark',
  className = '',
  tagline = 'Yes, you are right;',
}: LogoProps) {
  const iconSize = ICON_SIZE[variant]
  const textColor = variant === 'light' ? 'text-white' : 'text-navy'

  return (
    <Link
      href="/"
      aria-label="The Logiphiles — home"
      className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}
    >
      <Image
        src="/logo.png"
        alt=""
        aria-hidden="true"
        width={Math.round(iconSize * (1400 / 1637))}
        height={iconSize}
        priority
        className="h-auto w-auto"
        style={{ height: iconSize, width: 'auto' }}
      />
      <span className="flex flex-col items-start">
        <span
          className={`font-heading font-extrabold uppercase leading-none tracking-tight whitespace-nowrap ${WORDMARK_SIZE[variant]} ${textColor}`}
        >
          The Logiphiles
        </span>
        <span
          className={`mt-1 font-heading font-semibold uppercase leading-none tracking-[0.12em] text-mint whitespace-nowrap ${TAGLINE_SIZE[variant]}`}
        >
          {tagline}
        </span>
      </span>
    </Link>
  )
}
