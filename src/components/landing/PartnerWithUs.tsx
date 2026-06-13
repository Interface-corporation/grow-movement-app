import { motion } from 'framer-motion';
import { Building2, Briefcase, GraduationCap, ArrowRight, Sparkles, Users, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const tracks = [
  {
    icon: Building2,
    title: 'Companies & Firms',
    tag: 'Skills-based volunteering',
    color: 'from-grow-coral to-grow-gold',
    bullet: 'Talent development · ESG · Employee engagement',
    text: 'Collaborate with us to transform employee expertise into leadership development and social impact. Grow Movement helps organisations engage employees through meaningful skills-based global volunteering that advances talent development, employee engagement, ESG, and social impact goals.',
    cta: 'Partner as a company',
    href: '/contact',
  },
  {
    icon: Briefcase,
    title: 'Professionals & Mentors',
    tag: 'Volunteer coaching',
    color: 'from-grow-teal to-primary',
    bullet: 'Leadership · Coaching · Cross-cultural skills',
    text: 'Use your skills to create meaningful impact while developing your own leadership capabilities. Mentor ambitious entrepreneurs, build coaching and cross-cultural skills, expand your global perspective, and help businesses create jobs and economic opportunity.',
    cta: 'Become a mentor',
    href: '/apply/coach',
  },
  {
    icon: GraduationCap,
    title: 'Universities & Students',
    tag: 'Experiential learning',
    color: 'from-primary to-grow-coral',
    bullet: 'Consulting · Communication · Real-world projects',
    text: 'Apply classroom learning and frameworks to real-world challenges while developing leadership, consulting, cross-cultural, and communication skills. Students gain hands-on experience supporting entrepreneurs and social enterprises while building the capabilities needed to thrive in a global workforce.',
    cta: 'Partner with us',
    href: '/contact',
  },
];

export function PartnerWithUs() {
  return (
    <section id="partners" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background">
      {/* ambient shapes */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-grow-coral/10 blur-3xl"
        animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -left-20 w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-3xl"
        animate={{ y: [0, -25, 0], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-grow-coral/10 text-grow-coral text-[11px] font-bold tracking-[0.25em] uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Partner With Us
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-black mt-5 leading-[1.05]">
            How We Create <span className="bg-gradient-to-r from-grow-coral via-grow-gold to-primary bg-clip-text text-transparent">Impact Together</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Through Grow Movement, company professionals and university students coach and advise
            small businesses in emerging markets — creating jobs and economic opportunity while
            developing leadership, consulting, cross-cultural, and remote collaboration skills.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tracks.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Glow on hover */}
              <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500`} />

              <div className="relative h-full bg-card border border-border rounded-3xl p-7 md:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden">
                {/* Decorative corner gradient */}
                <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${t.color} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: -6, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg mb-5`}
                >
                  <t.icon className="h-8 w-8 text-white" strokeWidth={2.25} />
                </motion.div>

                <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground mb-2">
                  {t.tag}
                </span>
                <h3 className="font-display text-2xl md:text-[1.65rem] font-bold leading-tight mb-3">
                  {t.title}
                </h3>
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${t.color} mb-4`} />
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {t.text}
                </p>
                <div className="text-xs font-semibold text-foreground/70 mb-5 flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r ${t.color} shrink-0`} />
                  <span>{t.bullet}</span>
                </div>

                <Link to={t.href}>
                  <Button
                    variant="outline"
                    className="w-full group/btn border-border hover:border-grow-coral hover:bg-grow-coral hover:text-white transition-all"
                  >
                    {t.cta}
                    <ArrowRight className="ml-1.5 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Entrepreneurs & Communities — featured strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-grow-navy via-grow-navy to-[#1f1530] text-white p-8 md:p-12 shadow-2xl"
        >
          <motion.div
            aria-hidden
            className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-grow-coral/20 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-grow-gold to-grow-coral flex items-center justify-center shadow-xl">
              <Users className="h-8 w-8 text-white" strokeWidth={2.25} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe2 className="h-4 w-4 text-grow-gold" />
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-grow-gold">
                  Entrepreneurs &amp; Communities
                </span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Grow your business with global coaching.
              </h3>
              <p className="text-white/80 leading-relaxed max-w-2xl">
                Through remote business mentoring and practical guidance from experienced
                professionals around the world, you'll gain the knowledge, confidence, and
                networks needed to grow yourself, your team, and your business.
              </p>
            </div>
            <Link to="/apply" className="shrink-0">
              <Button size="lg" className="bg-grow-gold text-grow-navy hover:bg-white shadow-xl">
                Apply now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
