import { ScrollReveal } from '@/components/ScrollReveal'

const TERMS = [
  'HEADLINES',
  'TAGLINES',
  'CAMPAIGNS',
  'SCRIPTS',
  'COPY',
  'CONCEPTS',
  'SOCIAL',
  'DIGITAL',
  'PRINT',
  'OOH',
  'BRAND FILMS',
]

export function AdvertisingWriting() {
  const doubled = [...TERMS, ...TERMS]

  return (
    <section className="overflow-hidden bg-navy py-28 md:py-36">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <ScrollReveal>
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-teal">
            03 — HERO SERVICE
          </span>
          <h2 className="mt-4 font-heading text-[clamp(2.25rem,6vw,5.5rem)] font-extrabold leading-[0.98] tracking-tight text-white">
            ADVERTISING
            <br />
            <span className="text-teal">WRITING.</span>
          </h2>

          <p className="mt-10 max-w-2xl font-heading text-xl font-bold leading-tight tracking-tight text-white/85 sm:text-2xl md:text-3xl">
            IDEAS DON&apos;T SELL THEMSELVES.
            <br />
            SOMEONE HAS TO WRITE THEM RIGHT.
          </p>
        </ScrollReveal>
      </div>

      <div className="no-scrollbar mt-20 flex overflow-hidden md:mt-28">
        <div className="marquee-left flex shrink-0 items-center gap-8 pr-8">
          {doubled.map((term, i) => (
            <span
              key={`${term}-${i}`}
              className="flex items-center gap-8 font-heading text-3xl font-extrabold tracking-tight text-white/25 sm:text-5xl md:text-6xl"
            >
              {term}
              <span className="text-teal/40">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
