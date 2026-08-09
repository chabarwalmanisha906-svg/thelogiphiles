import { ScrollReveal } from '@/components/ScrollReveal'

export function FinalStatement() {
  return (
    <section className="bg-navy px-6 py-28 md:px-10 md:py-40">
      <div className="relative mx-auto max-w-[1600px]">
        <ScrollReveal>
          <p className="font-heading text-[clamp(2.25rem,7vw,6rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            GOOD WORDS GET ATTENTION.
            <br />
            RIGHT WORDS GET <span className="text-mint">REMEMBERED.</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
