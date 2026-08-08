import { ScrollReveal } from '@/components/ScrollReveal'
import { LanguageTicker } from '@/components/LanguageTicker'

export function LanguagesSection() {
  return (
    <section className="bg-offwhite py-28 md:py-36">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <ScrollReveal>
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-teal-dark">
            05 — LANGUAGE
          </span>
          <h2 className="mt-4 font-heading text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
            ONE IDEA.
            <br />
            36+ WAYS TO SAY IT.
          </h2>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-navy/70 sm:text-lg">
            We work across Indian and global languages, combining linguistic accuracy with
            cultural understanding.
          </p>
        </ScrollReveal>
      </div>

      <div className="mt-16 md:mt-20">
        <LanguageTicker />
      </div>
    </section>
  )
}
