import { getClients, getPosts, getSiteSettings, getWork } from '@/lib/data'
import { Hero } from '@/components/sections/Hero'
import { WhatWeDo } from '@/components/sections/WhatWeDo'
import { AdvertisingWriting } from '@/components/sections/AdvertisingWriting'
import { WorkPreview } from '@/components/sections/WorkPreview'
import { Philosophy } from '@/components/sections/Philosophy'
import { LanguagesSection } from '@/components/sections/LanguagesSection'
import { Credentials } from '@/components/sections/Credentials'
import { InsightsPreview } from '@/components/sections/InsightsPreview'
import { ClientsSection } from '@/components/sections/ClientsSection'
import { WhoWeAre } from '@/components/sections/WhoWeAre'
import { FinalStatement } from '@/components/sections/FinalStatement'
import { ContactSection } from '@/components/sections/ContactSection'

// Without this, the static page only picks up new CMS content (blog posts,
// work items, client logos) on the next deploy — this refreshes it in the
// background periodically instead.
export const revalidate = 60

export default async function Home() {
  const [settings, work, posts, clients] = await Promise.all([
    getSiteSettings(),
    getWork(),
    getPosts(),
    getClients(),
  ])

  return (
    <>
      <Hero settings={settings} />
      <WhatWeDo />
      <AdvertisingWriting />
      <WorkPreview items={work} />
      <Philosophy />
      <LanguagesSection />
      <Credentials settings={settings} />
      <InsightsPreview items={posts} />
      <ClientsSection clients={clients} />
      <WhoWeAre />
      <FinalStatement />
      <ContactSection settings={settings} />
    </>
  )
}
