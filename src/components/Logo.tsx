import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  variant?: 'dark' | 'light'
  className?: string
}

const SIZES: Record<NonNullable<LogoProps['variant']>, number> = {
  dark: 40,
  light: 52,
}

export function Logo({ variant = 'dark', className = '' }: LogoProps) {
  const height = SIZES[variant]

  return (
    <Link href="/" aria-label="The Logiphiles — home" className={`inline-flex shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="The Logiphiles"
        width={Math.round(height * (1400 / 1637))}
        height={height}
        priority
        className="h-auto w-auto"
        style={{ height, width: 'auto' }}
      />
    </Link>
  )
}
