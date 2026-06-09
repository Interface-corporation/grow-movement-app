# Grow Movement — Modernization & Seed Fund Overhaul Plan

This is a large multi-area update. I'll group it into 6 work streams. Confirm or adjust before I implement.

---

## 1. Global Typography & Navbar

- Load **Glacial Indifference** (headings) and **Roboto** (body) via `@fontsource` packages.
- Update `tailwind.config.ts` (`fontFamily.display`, `fontFamily.sans`) and `src/index.css` base styles so every `h1–h6` uses Glacial Indifference, all body text uses Roboto.
- Sweep components to remove leftover custom font classes.
- **Navbar**: rewrite `src/components/Navbar.tsx` so text is always legible on any background — solid text color + soft backdrop-blur pill behind links when over hero images, smooth transition to dark text on scroll. Remove the two separate Apply links → single **Apply** entry pointing to `/apply`.

## 2. Unified Apply Hub

- Rebuild `src/pages/ApplyChoose.tsx` (`/apply`) as the only entry point: program intro, eligibility, then two premium choice cards → `/apply/entrepreneur` and `/apply/coach`.
- Remove the duplicate Apply links from `Navbar.tsx` and footer.

## 3. Seed Fund Page — Full Redesign (`src/pages/SeedFund.tsx`)

Sections, in order:

1. **Cinematic Hero Slider** — auto-sliding (Framer Motion `AnimatePresence`) with 3–4 narrative frames about the Seed Fund + Grow Movement using the provided copy. Ken Burns zoom, gradient overlay, dual CTA (Vote / Partner).
2. **Animated Impact Stats** — count-up numbers (entrepreneurs supported, countries, funds raised, jobs created) with scroll-triggered reveal.
3. **About the Program** — left: brief + short testimonial card; right: animated collage of related images with parallax/tilt hover.
4. **Meet the 2026 Candidates** heading + subheading + short "How voting works" explainer (3 micro-steps).
5. **Candidate Cards** — redesigned per uploaded reference: shorter portrait, founder name + flag, business name, country, sector chips, founder story (clamped), business summary, measurable impact, funding purpose, social links, "Read more" sheet, **Vote checkbox** at top of card (like the screenshot). Add a **sticky selection indicator** (desktop: top-right pinned panel; mobile: fixed bottom bar that expands on tap) showing current selections + "Submit My Selections (x/N)".
6. **Partners** — logo + name + desc cards in a smooth infinite marquee.
7. **Alumni** — each past candidate gets a one-sentence review describing how funds helped her.
8. **Partner with Grow Movement banner** — cinematic glassmorphism section with the 4 partner-type cards (Companies, Professionals, Universities, Foundations) and a single CTA **Contact us**. Replace the old "Donate to the fund" button with **Contact us** (and keep a secondary **Vote our candidates** anchor).
9. **Closing message** — large editorial typography of the "Together, we don't simply fund businesses..." quote.

## 4. Flexible Voting Authentication System

### Database (SQL migration to run on your Supabase)
New / extended tables:
- `seed_fund_competitions`: add `auth_method` (`otp` | `private_code` | `public_code`), `public_code` text, `max_selections` int default 1.
- `seed_fund_promo_codes`: `id, competition_id, code (unique), used_by_email, used_at, created_at`.
- `seed_fund_votes`: already exists — add `vote_token uuid`, `auth_method`, `selections_count`. Drop the unique-per-candidate constraint and instead enforce **one ballot per voter per competition** (unique on `competition_id, voter_email`), then store one row per selected candidate sharing the same `vote_token`.
- `seed_fund_audit_log`: `id, competition_id, voter_email, voter_ip, candidate_ids[], vote_token, auth_method, submitted_at`.
- RPC `cast_seed_fund_ballot(_competition_id, _voter_email, _voter_name, _candidate_ids[], _auth_method, _code)` — validates method, code/OTP, max selections, no-double-vote, inserts votes + audit row atomically.

### Edge functions
- Update `request-vote-otp` / `verify-vote-otp` to accept an **array of candidate_ids** and enforce `max_selections` exactly.
- New `validate-promo-code` function for private/public code paths.
- New `generate-promo-codes` function: admin-only, generates N unique codes for a competition, returns CSV for distribution.

### Admin dashboard (`AdminSeedFundVotes.tsx`)
- Per-competition settings panel: **Auth Method** (radio: OTP / Private Code / Public Code), **Max selections per voter** (number), **Public code** input (when applicable), **Generate promo codes** button (count input → downloads CSV).
- Live results: realtime subscription to `seed_fund_votes`, leaderboard + bar/pie auto-refresh.
- **Export results**: buttons for CSV and Excel (`.xlsx` via `xlsx` lib) — exports vote totals + full audit log.
- Audit log tab: searchable table of every ballot (email, time, candidates, token, method).

### Voter flow on SeedFund page
- Multi-step modal that adapts to the competition's `auth_method`:
  - OTP → email → code → confirm selections
  - Private code → enter unique code → confirm
  - Public code → enter shared code → email (for audit) → confirm
- Enforces exact `max_selections` before "Submit" is enabled.
- Success screen shows the `vote_token` for the voter's records.

## 5. Contact Page (`src/pages/Contact.tsx`)

- Real details: Violet Busingye, Co-Founder, violet@growmovement.org, 86–90 Paul Street, London EC2A 4NE, +44 (0) 7943592369.
- Generated QR code linking to the email.
- Premium enquiry form (name, email, organisation, interest dropdown — partnership / volunteering / mentoring / sponsorship / grant / investment / entrepreneur support, message) with zod validation; stores to a new `contact_enquiries` table.
- Update footer + Partner CTA links to `/contact`.

## 6. Site-wide Polish Pass

- Audit all pages for typography consistency, spacing rhythm, premium micro-interactions (subtle hover lifts, gradient accents, glassmorphism cards), and a11y (semantic landmarks, alt text, focus states).
- Add scroll-reveal on key sections, consistent section padding tokens.

---

## Technical notes (for reference)

- Voting integrity: server-side via Postgres RPC + RLS; client never trusts itself.
- All new tables: include `GRANT` block + RLS policies; admin writes via `service_role` in edge functions.
- Realtime: enable Supabase replication on `seed_fund_votes` for live admin dashboard.
- Libraries to add: `@fontsource/roboto`, `xlsx`, `qrcode.react` (or keep the api.qrserver image), `react-intersection-observer` (if not present).

---

## Manual steps you'll need to do
1. Run the new SQL migration I'll provide in `db/seed_fund_voting.sql` in your Supabase SQL editor.
2. Redeploy edge functions: `request-vote-otp`, `verify-vote-otp`, `validate-promo-code`, `generate-promo-codes`.
3. Confirm `RESEND_API_KEY` is set (already done previously).

---

**Shall I proceed with all 6 streams as one large update, or would you prefer I ship them in phases (e.g. 1+2+5 first, then 3+4, then 6)?**
