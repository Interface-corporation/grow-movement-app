import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Copy,
  Check,
  Mail,
  Building2,
  Globe2,
  HandHeart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import donateHero from '@/assets/donate-hero.jpg';

const bankDetails = [
  { label: 'Account Name', value: 'Grow Movement' },
  { label: 'Account Number', value: '14995917' },
  { label: 'Sort Code', value: '04-06-05' },
  { label: 'Bank Country', value: 'United Kingdom' },
];

const impactItems = [
  {
    icon: Users,
    amount: '$50',
    title: 'Coaching session',
    description: 'Funds one structured coaching session for an emerging entrepreneur.',
  },
  {
    icon: Briefcase,
    amount: '$200',
    title: 'Business toolkit',
    description: 'Provides essential business resources, templates and digital tools.',
  },
  {
    icon: HandHeart,
    amount: '$600+',
    title: 'Volunteer overhead',
    description: 'Covers a volunteer’s administrative and program-running overheads.',
  },
];

const reasons = [
  {
    icon: Globe2,
    title: 'Global reach, local impact',
    body: 'Your gift powers programs in Africa and the Philippines, where it matters most.',
  },
  {
    icon: ShieldCheck,
    title: '100% transparent',
    body: 'Every contribution is tracked against real outcomes, sessions, and entrepreneurs.',
  },
  {
    icon: Sparkles,
    title: 'Lasting change',
    body: 'You’re not just funding programs — you’re building self-sustaining businesses.',
  },
];

export default function Donate() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="pt-16">
      {/* HERO */}
      <section className="relative overflow-hidden bg-grow-navy text-white">
        <div className="absolute inset-0">
          <img
            src={donateHero}
            alt="Entrepreneurs collaborating in a sunlit workshop"
            className="w-full h-full object-cover opacity-40"
            width={1600}
            height={1100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-grow-navy via-grow-navy/85 to-grow-navy/40" />
        </div>

        <motion.div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] bg-accent/25 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">
              <Heart className="h-3.5 w-3.5 fill-primary" /> Support the Movement
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
              Your gift fuels{' '}
              <span className="text-primary">real entrepreneurs,</span> real growth.
            </h1>
            <p className="text-lg md:text-xl text-white/75 leading-relaxed mb-8 max-w-2xl">
              Every contribution helps us cover essential program overheads so volunteers can keep
              transforming lives across Africa and the Philippines.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#bank-details">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  Donate Now <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="#contact">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2">
                  <Mail className="h-4 w-4" /> Contact Violet
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Your impact</span>
            <h2 className="font-display text-3xl md:text-5xl font-black mt-3 mb-4">
              Where your contribution goes
            </h2>
            <p className="text-muted-foreground text-lg">
              We keep overheads lean so the majority of your gift reaches the entrepreneurs and communities we serve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {impactItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-card border border-border rounded-3xl p-8 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="font-display text-3xl font-black text-foreground mb-2">{item.amount}</div>
                <div className="font-semibold text-foreground mb-2">{item.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY GIVE */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-7"
              >
                <r.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">{r.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{r.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BANK DETAILS */}
      <section id="bank-details" className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Make a Donation</span>
              <h2 className="font-display text-3xl md:text-5xl font-black mt-3 mb-5 leading-[1.1]">
                Direct bank transfer
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Your commitment as a volunteer or supporter not only changes lives but also helps us
                sustain our impact. To cover essential administrative costs and ensure our programs
                run smoothly, we kindly ask volunteers to consider a small contribution of{' '}
                <span className="text-foreground font-semibold">$600 or more</span> towards
                overheads.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Funds directly support local efforts in{' '}
                <span className="text-foreground font-semibold">Africa</span> and the{' '}
                <span className="text-foreground font-semibold">Philippines</span>. For more
                information or to contribute, please contact Violet or donate directly via the bank
                details on the right.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-[2rem] blur-2xl" />
              <div className="relative bg-card border border-border rounded-3xl p-8 md:p-10 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">UK Bank Details</div>
                    <div className="font-display text-xl font-bold">Grow Movement</div>
                  </div>
                </div>

                <ul className="space-y-3">
                  {bankDetails.map((d) => (
                    <li
                      key={d.label}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          {d.label}
                        </div>
                        <div className="font-mono font-semibold text-foreground truncate">{d.value}</div>
                      </div>
                      <button
                        onClick={() => copy(d.label, d.value)}
                        className="shrink-0 p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`Copy ${d.label}`}
                      >
                        {copied === d.label ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground/80 leading-relaxed">
                  Please reference <span className="font-semibold text-primary">“Grow Donation”</span>{' '}
                  on your transfer and email Violet so we can acknowledge your gift.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 md:py-28 bg-grow-navy text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Get in touch</span>
            <h2 className="font-display text-3xl md:text-5xl font-black mt-3 mb-5">
              Have questions? Talk to Violet.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              For partnership opportunities, larger gifts, or any questions about how your
              contribution will be used, Violet would love to hear from you.
            </p>
            <a
              href="mailto:grow@growmovement.org?subject=Donation%20to%20Grow%20Movement"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <Mail className="h-5 w-5" /> grow@growmovement.org
            </a>
            <div className="mt-10">
              <Link
                to="/apply/coach"
                className="text-white/70 hover:text-primary transition-colors text-sm inline-flex items-center gap-2"
              >
                Want to volunteer instead? Apply here <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
