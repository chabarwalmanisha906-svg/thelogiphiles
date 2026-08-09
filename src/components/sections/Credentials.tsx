import { ScrollReveal } from '@/components/ScrollReveal'
import type { SiteSettings } from '@/lib/data'

export function Credentials({ settings }: { settings: SiteSettings }) {
  const stats = (settings.stats ?? []).filter((s) => s.label)

  return (
    <section className="bg-offwhite px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-2 border-l border-t border-navy/15 md:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.06}>
              <div className="flex flex-col items-start gap-3 border-b border-r border-navy/15 p-8 md:p-10">
                <p className="font-heading text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-none tracking-tight text-navy">
                  {stat.value || '—'}
                </p>
                <p className="font-heading text-xs font-semibold tracking-[0.2em] text-mint sm:text-sm">
                  {stat.label.toUpperCase()}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
