import Link from 'next/link'

type LogoProps = {
  variant?: 'dark' | 'light'
  className?: string
}

export function Logo({ variant = 'dark', className = '' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-navy'
  const markColor = variant === 'light' ? 'bg-white' : 'bg-navy'

  return (
    <Link
      href="/"
      aria-label="The Logiphiles — home"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <span className={`relative h-6 w-6 shrink-0 ${markColor}`} aria-hidden="true">
        <span className="absolute inset-0 bg-teal [clip-path:polygon(0_0,100%_0,0_100%)]" />
      </span>
      <span
        className={`font-heading text-[15px] font-bold tracking-[0.08em] ${textColor} whitespace-nowrap`}
      >
        THE LOGIPHILES
      </span>
    </Link>
  )
}
