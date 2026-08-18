'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollReveal } from '@/components/ScrollReveal'
import { GhostHeading } from '@/components/GhostHeading'

type ServiceDetail = {
  number: string
  title: string
  items: string[]
  headingLine1: string
  headingLine2: string
  description: string[]
  detailItems: { heading: string; body: string }[]
  quote: string
}

const SERVICES: ServiceDetail[] = [
  {
    number: '01',
    title: 'ADVERTISING WRITING',
    items: ['Campaign concepts', 'Headlines', 'Taglines', 'Scripts', 'Ad copy', 'Social campaigns', 'Digital campaigns'],
    headingLine1: "WE DON'T JUST WRITE ADS.",
    headingLine2: 'WE WRITE THE REASON TO NOTICE THEM.',
    description: [
      "A campaign doesn't begin with a layout.",
      "It begins with an idea. A thought worth stopping for. A line worth remembering. A message worth passing on.",
      'At The Logiphiles, we turn those thoughts into advertising that gets noticed, understood and remembered.',
      'From the first spark of a campaign to the final word on screen, we write for brands, audiences and everything in between.',
    ],
    detailItems: [
      { heading: 'CAMPAIGN CONCEPTS', body: 'Big ideas that give campaigns something worth saying.' },
      { heading: 'HEADLINES & TAGLINES', body: 'Fewer words. More impact.' },
      { heading: 'TV & DIGITAL SCRIPTS', body: 'Stories written to be watched, heard and remembered.' },
      { heading: 'PRINT & OUTDOOR COPY', body: 'Words designed to work at a glance.' },
      { heading: 'SOCIAL MEDIA CAMPAIGNS', body: 'Ideas built for the scroll, share and conversation.' },
      { heading: 'BRAND FILMS', body: 'Stories that give brands something worth watching.' },
      { heading: 'PRODUCT CAMPAIGNS', body: 'Turning features into reasons to care.' },
      { heading: 'DIGITAL ADVERTISING', body: 'Copy that earns attention before it asks for a click.' },
    ],
    quote: 'THE RIGHT WORD CAN TURN A MESSAGE INTO A MEMORY.',
  },
  {
    number: '02',
    title: 'BRAND COPY',
    items: ['Brand voice', 'Positioning', 'Messaging', 'Website copy', 'Brand communication'],
    headingLine1: 'YOUR BRAND HAS A VOICE.',
    headingLine2: 'WE HELP IT FIND THE RIGHT WORDS.',
    description: [
      "A brand isn't just a logo, a colour palette or a clever tagline.",
      "It's what people hear when your brand speaks.",
      'At The Logiphiles, we build words around what your brand stands for, who it wants to reach and how it wants to be remembered.',
      "We create clear, consistent and distinctive communication that sounds like your brand and nobody else's.",
    ],
    detailItems: [
      { heading: 'BRAND VOICE', body: 'Defining how your brand sounds, speaks and behaves.' },
      { heading: 'POSITIONING', body: 'Finding the words that make your place in the market clear.' },
      { heading: 'BRAND MESSAGING', body: 'Turning what you do into something people understand.' },
      { heading: 'WEBSITE COPY', body: 'Writing digital experiences that inform, persuade and convert.' },
      { heading: 'TAGLINES & BRAND LINES', body: 'The few words that can carry an entire brand.' },
      { heading: 'BRAND GUIDELINES', body: 'Giving your communication a consistent verbal identity.' },
      { heading: 'CAMPAIGN MESSAGING', body: 'Taking your brand voice into campaigns people can connect with.' },
      { heading: 'CORPORATE COMMUNICATION', body: 'Making businesses sound human, clear and credible.' },
    ],
    quote: 'A GREAT BRAND IS RECOGNISABLE BY ITS VOICE.',
  },
  {
    number: '03',
    title: 'CONTENT',
    items: ['Social media', 'Articles', 'Blogs', 'Branded content', 'Long-form content'],
    headingLine1: 'CONTENT IS EVERYWHERE.',
    headingLine2: 'GOOD CONTENT HAS SOMEWHERE TO GO.',
    description: [
      'Another post. Another article. Another blog.',
      "The internet doesn't need more content. It needs content worth someone's time.",
      'At The Logiphiles, we create content with a purpose, a point of view and a voice.',
      'From a social post that earns a pause to a long-form story that earns a read, we write content that gives audiences a reason to stay.',
    ],
    detailItems: [
      { heading: 'SOCIAL MEDIA CONTENT', body: 'Ideas and copy designed to stop the scroll.' },
      { heading: 'ARTICLES & BLOGS', body: 'Useful, readable and genuinely worth finishing.' },
      { heading: 'BRANDED CONTENT', body: 'Stories where the brand belongs naturally in the conversation.' },
      { heading: 'LONG-FORM CONTENT', body: 'Deep dives, features, thought leadership and storytelling.' },
      { heading: 'WEBSITE CONTENT', body: 'Clear words that guide people through your digital world.' },
      { heading: 'CONTENT CAMPAIGNS', body: 'Multiple pieces connected by one strong idea.' },
      { heading: 'THOUGHT LEADERSHIP', body: 'Turning expertise into something people want to read.' },
      { heading: 'EDITORIAL CONTENT', body: 'Stories built around people, ideas and relevance.' },
    ],
    quote: "DON'T JUST FILL THE FEED. GIVE PEOPLE SOMETHING TO READ.",
  },
  {
    number: '04',
    title: 'LANGUAGE',
    items: ['Translation', 'Transcreation', 'Localization', 'Multilingual communication'],
    headingLine1: 'TRANSLATION CHANGES WORDS.',
    headingLine2: 'WE MAKE SURE THE IDEA SURVIVES.',
    description: [
      'A sentence can be grammatically perfect and still feel completely wrong.',
      "Because language isn't just about words. It's about context, culture, humour, emotion and intent.",
      'At The Logiphiles, we go beyond literal translation. We make ideas travel without losing what made them work in the first place.',
      'From Indian languages to global markets, we bring linguistic accuracy and cultural understanding together.',
    ],
    detailItems: [
      { heading: 'TRANSLATION', body: 'Accurate, natural and context-aware language conversion.' },
      { heading: 'TRANSCREATION', body: 'Recreating an idea without losing its impact.' },
      { heading: 'LOCALIZATION', body: 'Making communication feel native to its audience.' },
      { heading: 'MULTILINGUAL CAMPAIGNS', body: 'One campaign adapted intelligently across languages.' },
      { heading: 'REGIONAL CONTENT', body: 'Communication that understands local audiences and culture.' },
      { heading: 'SUBTITLING & SCRIPTS', body: 'Making stories work across languages and formats.' },
      { heading: 'LANGUAGE ADAPTATION', body: 'Preserving tone, personality and intent across markets.' },
      { heading: 'CULTURAL ADAPTATION', body: "Because what works in one place doesn't always work somewhere else." },
    ],
    quote: 'SAME IDEA. DIFFERENT LANGUAGE. SAME IMPACT.',
  },
  {
    number: '05',
    title: 'EDITORIAL',
    items: ['Editorial writing', 'Publications', 'Newsroom content', 'Long-form storytelling'],
    headingLine1: "WE DON'T JUST WRITE STORIES.",
    headingLine2: 'WE FIND THE STORY WORTH TELLING.',
    description: [
      'Good editorial writing doesn\'t shout. It makes you want to keep reading.',
      'At The Logiphiles, we work with ideas, information and stories to create writing that is clear, engaging and human.',
      "Whether it's a publication, newsroom, feature or long-form story, we bring an editorial eye to every word.",
    ],
    detailItems: [
      { heading: 'EDITORIAL ARTICLES', body: 'Stories with context, clarity and a point of view.' },
      { heading: 'PUBLICATIONS', body: 'Magazines, journals and branded publications.' },
      { heading: 'NEWSROOM CONTENT', body: 'Fast, accurate and readable editorial communication.' },
      { heading: 'FEATURES', body: 'Stories that go beyond the obvious.' },
      { heading: 'LONG-FORM STORYTELLING', body: 'Space for ideas that deserve more than a paragraph.' },
      { heading: 'INTERVIEWS & PROFILES', body: 'Turning conversations into compelling stories.' },
      { heading: 'OPINION & THOUGHT PIECES', body: 'Strong ideas expressed with an equally strong voice.' },
      { heading: 'EDITORIAL STRATEGY', body: 'Building a consistent content direction for publications and brands.' },
    ],
    quote: "EVERY STORY HAS A POINT. WE MAKE SURE IT'S WORTH READING.",
  },
  {
    number: '06',
    title: 'COMMUNICATION',
    items: ['Pitch decks', 'Presentations', 'Corporate communication', 'Business storytelling'],
    headingLine1: 'YOU KNOW WHAT YOU WANT TO SAY.',
    headingLine2: 'WE KNOW HOW TO SAY IT.',
    description: [
      "Business communication doesn't have to sound like business communication.",
      'Complex ideas can be clear. Important information can be interesting. And a presentation can actually make someone want to keep watching.',
      'At The Logiphiles, we turn business information into communication that people can understand, remember and act on.',
    ],
    detailItems: [
      { heading: 'PITCH DECKS', body: 'Presentations that make ideas easier to buy into.' },
      { heading: 'BUSINESS PRESENTATIONS', body: 'Clear storytelling for important conversations.' },
      { heading: 'CORPORATE COMMUNICATION', body: 'Professional communication without corporate jargon.' },
      { heading: 'COMPANY PROFILES', body: 'Turning business information into a compelling story.' },
      { heading: 'PROPOSALS', body: 'Writing that makes the opportunity clear.' },
      { heading: 'EXECUTIVE COMMUNICATION', body: 'Speeches, messages and leadership communication.' },
      { heading: 'SALES COMMUNICATION', body: 'Words that help teams explain value and create action.' },
      { heading: 'BUSINESS STORYTELLING', body: 'Making organisations easier to understand and remember.' },
    ],
    quote: "COMPLEX DOESN'T HAVE TO SOUND COMPLICATED.",
  },
]

export function WhatWeDo() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const active = openIndex !== null ? SERVICES[openIndex] : null

  useEffect(() => {
    document.documentElement.style.overflow = active ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [active])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <section
      id="what-we-do"
      className="relative scroll-mt-24 overflow-hidden bg-offwhite px-6 py-28 md:px-10 md:py-36"
    >
      <GhostHeading className="absolute -top-4 right-6 hidden md:right-10 lg:block">DO</GhostHeading>

      <div className="relative mx-auto max-w-[1600px]">
        <ScrollReveal>
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
            02 — SERVICES
          </span>
          <h2 className="mt-4 font-heading text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
            WHAT WE DO
          </h2>
        </ScrollReveal>

        <div className="mt-16 border-t border-navy/10">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.number} delay={i * 0.05}>
              <button
                type="button"
                data-cursor="EXPLORE →"
                onClick={() => setOpenIndex(i)}
                className="group grid w-full cursor-pointer grid-cols-1 items-center gap-4 border-b border-navy/10 py-8 text-left transition-colors duration-300 hover:bg-navy/[0.03] md:grid-cols-12 md:gap-8 md:py-10"
              >
                <span className="font-heading text-sm font-semibold tracking-[0.15em] text-navy/40 md:col-span-1">
                  {service.number}
                </span>

                <h3 className="font-heading text-2xl font-extrabold tracking-tight text-navy transition-transform duration-300 group-hover:translate-x-2 group-hover:text-mint sm:text-3xl md:col-span-4 md:text-4xl">
                  {service.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-navy/60 md:col-span-6 md:text-base">
                  {service.items.join('  ·  ')}
                </p>

                <span className="font-heading text-xl text-navy/20 transition-all duration-300 group-hover:translate-x-2 group-hover:text-mint md:col-span-1 md:text-right md:text-2xl">
                  →
                </span>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            key="service-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setOpenIndex(null)}
            className="fixed inset-0 z-[70] bg-navy/70 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.aside
            key="service-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.55, ease: [0.77, 0, 0.18, 1] }}
            className="fixed inset-y-0 right-0 z-[80] w-full overflow-y-auto bg-white sm:w-[85vw] lg:w-[62vw]"
          >
            <div className="relative px-6 pb-16 pt-20 sm:px-12 lg:px-16 lg:pt-24">
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center font-heading text-3xl font-light text-navy transition-transform duration-300 hover:rotate-90 hover:text-mint sm:right-8 sm:top-6"
              >
                ×
              </button>

              <div className="font-heading text-[13px] font-bold tracking-[0.1em] text-navy">
                <span className="text-mint">{active.number} /</span> {active.title}
              </div>

              <div className="mb-6 mt-6 h-[3px] w-9 bg-mint" />

              <h2 className="mb-8 font-heading text-[clamp(2.2rem,5vw,3.75rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
                {active.headingLine1}
                <br />
                <span className="text-mint">{active.headingLine2}</span>
              </h2>

              <div className="space-y-4 font-body text-base leading-[1.8] text-navy/80">
                {active.description.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="my-9 h-px w-full bg-navy/10" />

              <h4 className="mb-5 font-heading text-sm font-semibold tracking-[0.1em] text-navy">
                WHAT WE DO
              </h4>

              <div className="grid grid-cols-1 border-l border-t border-navy/10 sm:grid-cols-2">
                {active.detailItems.map((item) => (
                  <div
                    key={item.heading}
                    className="min-h-[110px] border-b border-r border-navy/10 p-5 transition-colors duration-300 hover:bg-mint/10"
                  >
                    <h5 className="mb-1.5 font-heading text-xs font-bold leading-tight text-navy">
                      {item.heading}
                    </h5>
                    <p className="font-body text-xs leading-relaxed text-navy/60">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-9 border-y border-navy/10 py-8 text-center font-heading text-lg font-bold leading-relaxed text-mint">
                {active.quote}
              </div>

              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <strong className="block font-heading text-[13px] text-navy">
                    GOT SOMETHING TO SAY?
                  </strong>
                  <span className="block font-body text-[13px] text-navy/60">
                    Let&apos;s find the words.
                  </span>
                </div>

                <a
                  href="#contact"
                  onClick={() => setOpenIndex(null)}
                  className="inline-block whitespace-nowrap rounded-full bg-mint px-6 py-3.5 font-heading text-[11px] font-bold text-navy transition-colors duration-300 hover:bg-navy hover:text-white"
                >
                  LET&apos;S WRITE IT →
                </a>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </section>
  )
}
