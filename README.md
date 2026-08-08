# The Logiphiles

Website for The Logiphiles — an advertising writing and brand communication agency. Built with
Next.js (App Router) and Payload CMS.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Payload CMS 3** (co-located inside the Next.js app under `/admin`), MongoDB adapter
- **Framer Motion** for scroll reveals, the mobile menu, and the custom cursor
- **Resend** for contact-form email delivery

## Content model (edit in `/admin`, no code required)

- **Work** — case studies (Work grid + template detail page with challenge/approach/writing/outcome/gallery)
- **Posts** ("Insights") — articles, with categories, draft/publish status, and SEO fields
- **Clients** — logo grid shown in the "Trusted to Write" section
- **Enquiries** — every contact-form submission is stored here, in addition to being emailed
- **Site Settings** (global) — hero copy, credential stats, contact email, social links, default SEO

## Local setup

1. Copy the env template and fill in real values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URI` — a MongoDB connection string (e.g. from a free MongoDB Atlas cluster)
   - `PAYLOAD_SECRET` — any long random string:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `RESEND_API_KEY` — from [resend.com](https://resend.com) (contact form emails still get
     stored in the Enquiries collection even without this)

2. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```

3. Visit [http://localhost:3000](http://localhost:3000) for the site and
   [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS. The first visit to
   `/admin` prompts you to create the first admin user.

## Deploying (Vercel)

1. Import this repo in the [Vercel dashboard](https://vercel.com/new).
2. Add the same environment variables from `.env` to the Vercel project (Settings → Environment
   Variables), setting `NEXT_PUBLIC_SITE_URL` to your production domain.
3. **Image uploads**: Payload's default local-disk storage does not persist on Vercel's
   serverless filesystem. Before uploading real Work/Insights/Client images in production, add a
   cloud storage adapter, e.g. `@payloadcms/storage-vercel-blob`, and wire it into
   `src/payload.config.ts`.

## Notes

- Brand palette, type scale, and section content follow the internal creative brief; colors and
  fonts are defined as design tokens in `src/app/(frontend)/globals.css`.
- The logo in the nav/footer is currently a text-based placeholder wordmark
  (`src/components/Logo.tsx`) pending the final logo file.
