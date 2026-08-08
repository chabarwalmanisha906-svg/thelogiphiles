import { ScrollReveal } from '@/components/ScrollReveal'

const SERVICES = [
  {
    number: '01',
    title: 'ADVERTISING WRITING',
    items: ['Campaign concepts', 'Headlines', 'Taglines', 'Scripts', 'Ad copy', 'Social campaigns', 'Digital campaigns'],
  },
  {
    number: '02',
    title: 'BRAND COPY',
    items: ['Brand voice', 'Positioning', 'Messaging', 'Website copy', 'Brand communication'],
  },
  {
    number: '03',
    title: 'CONTENT',
    items: ['Social media', 'Articles', 'Blogs', 'Branded content', 'Long-form content'],
  },
  {
    number: '04',
    title: 'LANGUAGE',
    items: ['Translation', 'Transcreation', 'Localization', 'Multilingual communication'],
  },
  {
    number: '05',
    title: 'EDITORIAL',
    items: ['Editorial writing', 'Publications', 'Newsroom content', 'Long-form storytelling'],
  },
  {
    number: '06',
    title: 'COMMUNICATION',
    items: ['Pitch decks', 'Presentations', 'Corporate communication', 'Business storytelling'],
  },
]

export function WhatWeDo() {
  return (
    <section id="what-we-do" className="scroll-mt-24 bg-offwhite px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal>
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-teal-dark">
            02 — SERVICES
          </span>
          <h2 className="mt-4 font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
            WHAT WE DO
          </h2>
        </ScrollReveal>

        <div className="mt-16 border-t border-navy/10">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.number} delay={i * 0.05}>
              <div
                data-cursor="EXPLORE →"
                className="group grid cursor-default grid-cols-1 items-center gap-4 border-b border-navy/10 py-8 transition-colors duration-300 hover:bg-navy/[0.03] md:grid-cols-12 md:gap-8 md:py-10"
              >
                <span className="font-heading text-sm font-semibold tracking-[0.15em] text-navy/40 md:col-span-1">
                  {service.number}
                </span>

                <h3 className="font-heading text-2xl font-extrabold tracking-tight text-navy transition-transform duration-300 group-hover:translate-x-2 group-hover:text-teal-dark sm:text-3xl md:col-span-4 md:text-4xl">
                  {service.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-navy/60 md:col-span-6 md:text-base">
                  {service.items.join('  ·  ')}
                </p>

                <span className="font-heading text-xl text-navy/20 transition-all duration-300 group-hover:translate-x-2 group-hover:text-teal md:col-span-1 md:text-right md:text-2xl">
                  →
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
