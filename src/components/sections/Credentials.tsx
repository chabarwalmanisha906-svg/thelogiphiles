import { ScrollReveal } from '@/components/ScrollReveal'
import type { SiteSettings } from '@/lib/data'

export function Credentials({ settings }: { settings: SiteSettings }) {
  const stats = (settings.stats ?? []).filter((s) => s.label)

  return (
    <section className="mark-pattern-light bg-dark-bg px-6 py-24 md:px-10 md:py-32">
      <div className="relative mx-auto grid max-w-[1600px] grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.label} delay={i * 0.06}>
            <p className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-none tracking-tight text-teal">
              {stat.value || '—'}
            </p>
            <p className="mt-3 font-heading text-xs font-semibold tracking-[0.2em] text-white/60 sm:text-sm">
              {stat.label.toUpperCase()}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
