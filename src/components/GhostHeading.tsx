type GhostHeadingProps = {
  children: string
  variant?: 'onDark' | 'onLight'
  className?: string
}

export function GhostHeading({ children, variant = 'onLight', className = '' }: GhostHeadingProps) {
  const color = variant === 'onDark' ? 'text-white/[0.07]' : 'text-navy/[0.06]'

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none block select-none font-heading text-[clamp(4.5rem,16vw,12rem)] font-extrabold uppercase leading-none tracking-tight ${color} ${className}`}
    >
      {children}
    </span>
  )
}
