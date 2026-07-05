import { motion } from 'framer-motion';

import bcg        from '@/assets/partners/bcg.png';
import booth      from '@/assets/partners/booth.png';
import cbs        from '@/assets/partners/CBS.png';
import cems       from '@/assets/partners/cems.png';
import genem      from '@/assets/partners/genem.png';
import growPng    from '@/assets/partners/grow.png';
import inspire    from '@/assets/partners/inspire.png';
import lbs        from '@/assets/partners/lbs.png';
import linklaters from '@/assets/partners/linklaters.png';
import lse        from '@/assets/partners/lse.png';
import ncif       from '@/assets/partners/NCIF.png';

// ─── Partner data ─────────────────────────────────────────────────────────────
const partners = [
  {
    name: 'BCG',
    logo: bcg,
    bg: '#ffffff',
    desc: 'Global strategy consulting firm providing pro-bono advisory to our top-performing ventures.',
  },
  {
    name: 'Chicago Booth',
    logo: booth,
    bg: '#ffffff',
    desc: 'World-renowned business school sharing cutting-edge entrepreneurship curriculum and research.',
  },
  {
    name: 'CBS',
    logo: cbs,
    bg: '#ffffff',
    desc: 'Copenhagen Business School — academic partner supporting our European entrepreneur network.',
  },
  {
    name: 'CEMS',
    logo: cems,
    bg: '#ffffff',
    desc: 'Global alliance of leading business schools advancing management education worldwide.',
  },
  {
    name: 'GenEM Foundation',
    logo: genem,
    bg: '#ffffff',
    desc: 'Dedicated to developing the next generation of emerging market entrepreneurs.',
  },
  {
    name: 'Grow Movement',
    logo: growPng,
    bg: '#ffffff',
    desc: 'Our founding organisation — connecting volunteer coaches with entrepreneurs across Africa & Asia.',
  },
  {
    name: 'Inspire Dreams & Startups',
    logo: inspire,
    bg: '#ffffff',
    desc: 'Ecosystem builder accelerating early-stage startups with mentorship and market access.',
  },
  {
    name: 'London Business School',
    logo: lbs,
    bg: '#1e3a5f',
    desc: 'Top-ranked global business school providing leadership development and coaching expertise.',
  },
  {
    name: 'Linklaters',
    logo: linklaters,
    bg: '#ffffff',
    desc: 'Elite global law firm — our strategic legal partner supporting entrepreneurs with pro-bono counsel.',
  },
  {
    name: 'LSE',
    logo: lse,
    bg: '#1a1a1a',
    desc: 'London School of Economics — research and policy partner driving evidence-based entrepreneurship.',
  },
  {
    name: 'NCIF',
    logo: ncif,
    bg: '#ffffff',
    desc: 'National Community Investment Fund channelling capital to underserved entrepreneurs.',
  },
];

// ─── Single card ──────────────────────────────────────────────────────────────
function PartnerCard({ p, i }: { p: typeof partners[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: i * 0.06 }}
      whileHover={{ y: -6, scale: 1.03 }}
      className="group relative rounded-2xl border border-border overflow-hidden cursor-default shadow-sm hover:shadow-xl transition-shadow"
      style={{ background: p.bg }}
      title={p.name}
    >
      <div className="flex items-center justify-center h-36 px-8 py-6">
        <motion.img
          src={p.logo}
          alt={p.name}
          className="max-h-20 max-w-full w-auto object-contain"
          whileHover={{ scale: 1.08, rotate: -1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        />
      </div>

      {/* Shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Bottom accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 right-0 h-[3px] origin-left"
        style={{ background: 'linear-gradient(to right, var(--grow-coral), var(--grow-gold))' }}
      />
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function Partners() {
  return (
    <section id="partners" className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-grow-coral/10 text-grow-coral text-[11px] font-bold tracking-[0.22em] uppercase mb-5">
            In Partnership With
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight text-foreground">
            Our Global{' '}
            <span className="bg-gradient-to-r from-grow-coral to-grow-gold bg-clip-text text-transparent">
              Partners
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            Backed by world-leading consultancies, law firms, universities and impact organisations.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {partners.map((p, i) => (
            <PartnerCard key={p.name} p={p} i={i} />
          ))}
        </div>

        {/* Footer line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          {/* {partners.length} partner organisations across consulting, law, academia &amp; impact finance */}
        </motion.p>

      </div>
    </section>
  );
}