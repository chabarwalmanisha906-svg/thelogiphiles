import { ScrollReveal } from '@/components/ScrollReveal'

export function WhoWeAre() {
  return (
    <section id="who-we-are" className="scroll-mt-24 bg-offwhite px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal>
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-teal-dark">
            07 — WHO WE ARE
          </span>
          <h2 className="mt-4 font-heading text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-tight text-navy">
            WHO ARE THE LOGIPHILES?
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <ScrollReveal delay={0.05} className="md:col-span-7">
            <p className="font-heading text-[clamp(1.75rem,4.5vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight text-navy">
              PEOPLE OBSESSED WITH WORDS.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="flex flex-col gap-6 md:col-span-5">
            <div className="space-y-1 font-body text-lg leading-relaxed text-navy/80">
              <p>We write advertising.</p>
              <p>We build brand voices.</p>
              <p>We create content.</p>
              <p>We translate ideas across languages.</p>
              <p>We tell stories.</p>
              <p>We make communication clearer.</p>
            </div>

            <p className="font-body text-lg italic leading-relaxed text-navy/60">
              And sometimes, we rewrite the sentence for the fifteenth time because the
              fourteenth one wasn&apos;t right.
            </p>

            <p className="font-body text-lg leading-relaxed text-navy/80">
              We believe good communication isn&apos;t about using more words.
              <br />
              It&apos;s about finding the right ones.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
