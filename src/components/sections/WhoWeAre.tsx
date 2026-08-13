import Link from 'next/link'
import {
  Armchair,
  BookOpen,
  FileText,
  Languages,
  Megaphone,
  MessageCircle,
  PenLine,
  Quote,
} from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'
import { GhostHeading } from '@/components/GhostHeading'

const SERVICES = [
  { icon: PenLine, text: 'We write advertising.' },
  { icon: MessageCircle, text: 'We build brand voices.' },
  { icon: FileText, text: 'We create content.' },
  { icon: Languages, text: 'We translate ideas across languages.' },
  { icon: BookOpen, text: 'We tell stories.' },
  { icon: Megaphone, text: 'We make communication clearer.' },
]

function renderService(text: string) {
  const lastSpace = text.lastIndexOf(' ', text.length - 2)
  return (
    <>
      {text.slice(0, lastSpace + 1)}
      <strong className="font-bold text-navy">{text.slice(lastSpace + 1)}</strong>
    </>
  )
}

export function WhoWeAre() {
  return (
    <section id="who-we-are" className="relative scroll-mt-24 overflow-hidden bg-offwhite px-6 py-28 md:px-10 md:py-36">
      <GhostHeading className="absolute left-0 top-24 hidden lg:block">WRITE</GhostHeading>

      <div className="relative mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-10">
          {/* Left column */}
          <div className="relative">
            <ScrollReveal>
              <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
                07 — WHO WE ARE
              </span>
              <h2 className="mt-4 font-heading text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight text-navy">
                WHO ARE THE
                <br />
                LOGIPHILES?
              </h2>

              <div className="my-8 h-1 w-11 bg-mint" />

              <p className="font-heading text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-[1.1] tracking-tight text-navy">
                PEOPLE OBSESSED
                <br />
                WITH <span className="text-mint">WORDS.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="mt-12 max-w-xs -rotate-3 font-hand text-2xl leading-tight text-navy">
                Because the right words change everything.
              </p>
            </ScrollReveal>
          </div>

          {/* Right column */}
          <div className="relative">
            <div className="absolute -top-6 right-0 hidden h-[110px] w-[110px] items-center justify-center sm:flex">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_15s_linear_infinite]">
                <path
                  id="who-we-are-circle"
                  fill="transparent"
                  d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                />
                <text
                  fontFamily="var(--font-heading)"
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#10b981"
                  letterSpacing="2"
                >
                  <textPath href="#who-we-are-circle" startOffset="0%">
                    PEOPLE OBSESSED WITH WORDS •
                  </textPath>
                </text>
              </svg>
              <Armchair className="text-mint" size={24} strokeWidth={2} />
            </div>

            <ScrollReveal delay={0.05} className="mt-8 sm:mt-0">
              <ul className="mb-10">
                {SERVICES.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-5 border-b border-navy/5 py-[18px] font-body text-[15px] text-navy/70 first:pt-0"
                  >
                    <Icon className="w-[30px] shrink-0 text-mint" size={20} strokeWidth={2} />
                    {renderService(text)}
                  </li>
                ))}
              </ul>

              <div className="mb-8 flex gap-4 rounded bg-navy/[0.04] px-7 py-6">
                <Quote className="mt-0.5 shrink-0 text-mint" size={22} strokeWidth={2} />
                <p className="font-body text-sm italic leading-relaxed text-navy">
                  And sometimes, we rewrite the sentence for the fifteenth time because the
                  fourteenth one wasn&apos;t right.
                </p>
              </div>

              <p className="mb-8 max-w-md font-body text-sm leading-relaxed text-navy/70">
                We believe good communication isn&apos;t about using more words. It&apos;s about{' '}
                <strong className="font-bold text-navy">finding the right ones.</strong>
              </p>

              <Link
                href="/team"
                data-cursor="EXPLORE →"
                className="group inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-mint"
              >
                Meet the team
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
