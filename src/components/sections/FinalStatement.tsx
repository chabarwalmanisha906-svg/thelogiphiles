import { ScrollReveal } from '@/components/ScrollReveal'

export function FinalStatement() {
  return (
    <section className="relative overflow-hidden bg-navy px-6 py-28 md:px-10 md:py-40">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-8 select-none font-serif text-[22rem] font-bold leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.08)] md:right-14"
      >
        ;
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-9 right-10 hidden items-end gap-5 sm:flex md:right-14"
      >
        <span className="mb-1 h-[7px] w-[7px] rounded-full bg-mint" />
        <span
          className="h-[70px] w-[130px]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
            backgroundSize: '14px 14px',
          }}
        />
      </div>

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
