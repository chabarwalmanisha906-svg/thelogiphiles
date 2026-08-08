import { ScrollReveal } from '@/components/ScrollReveal'
import { ContactForm } from '@/components/ContactForm'
import type { SiteSettings } from '@/lib/data'

export function ContactSection({ settings }: { settings: SiteSettings }) {
  return (
    <section id="contact" className="scroll-mt-24 bg-offwhite px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-14 md:grid-cols-12 md:gap-10">
        <ScrollReveal className="md:col-span-6">
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-teal-dark">
            08 — CONTACT
          </span>
          <h2 className="mt-4 font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
            LET&apos;S TALK.
          </h2>

          <div className="mt-8 space-y-1 font-body text-lg leading-relaxed text-navy/70">
            <p>Have an idea?</p>
            <p>A campaign?</p>
            <p>A brand that needs a voice?</p>
            <p>Or a sentence that isn&apos;t quite right?</p>
          </div>
          <p className="mt-4 font-heading text-lg font-bold tracking-tight text-navy">
            Let&apos;s fix it.
          </p>

          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="mt-8 inline-block font-heading text-base font-semibold tracking-tight text-teal-dark underline decoration-teal-dark/40 underline-offset-4 transition-colors hover:text-navy"
            >
              {settings.contactEmail}
            </a>
          )}
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="md:col-span-6">
          <ContactForm />
        </ScrollReveal>
      </div>
    </section>
  )
}
