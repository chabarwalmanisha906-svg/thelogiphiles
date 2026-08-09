const ROW_ONE = [
  'हिन्दी',
  'ENGLISH',
  'मराठी',
  'বাংলা',
  'ગુજરાતી',
  'தமிழ்',
  'తెలుగు',
  'ಕನ್ನಡ',
]

const ROW_TWO = ['മലയാളം', 'ਪੰਜਾਬੀ', 'ESPAÑOL', 'FRANÇAIS', 'DEUTSCH', 'ITALIANO', 'العربية', 'ENGLISH']

function Row({ items, className }: { items: string[]; className: string }) {
  const doubled = [...items, ...items]
  return (
    <div className="no-scrollbar flex py-3 [clip-path:inset(-100vh_0_-100vh_0)]">
      <div className={`flex shrink-0 items-center gap-10 pr-10 leading-[1.4] ${className}`}>
        {doubled.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className={`font-heading text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl ${
              i % 2 === 0 ? 'text-navy' : 'text-teal-dark'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}

export function LanguageTicker() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-10">
      <Row items={ROW_ONE} className="marquee-left" />
      <Row items={ROW_TWO} className="marquee-right" />
    </div>
  )
}
