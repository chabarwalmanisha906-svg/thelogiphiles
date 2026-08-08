import { ScrollReveal } from '@/components/ScrollReveal'

const STATEMENTS = [
  ['YOU HAVE THE IDEA.', 'WE WRITE IT.'],
  ['YOU HAVE THE PRODUCT.', 'WE FIND THE WORDS.'],
  ['YOU HAVE SOMETHING TO SAY.', 'WE MAKE PEOPLE LISTEN.'],
]

export function Philosophy() {
  return (
    <section className="bg-offwhite px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-16 md:gap-24">
        {STATEMENTS.map((lines, i) => (
          <ScrollReveal key={lines[0]} delay={i * 0.05} y={40}>
            <p
              className={`font-heading text-[clamp(1.9rem,6vw,4.75rem)] font-extrabold leading-[1.05] tracking-tight ${
                i % 2 === 0 ? 'text-left' : 'text-right'
              }`}
            >
              <span className="text-navy">{lines[0]} </span>
              <span className="text-teal-dark">{lines[1]}</span>
            </p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
