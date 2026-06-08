import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Calendar, Globe2, Mail, MapPin, Sparkles, Trophy,
  Users, ArrowRight, CheckCircle2, Vote, Loader2, RotateCcw,
  Heart, Briefcase, Building2, GraduationCap, Lightbulb, ChevronDown,
  ChevronRight, Facebook, Linkedin, Instagram, Twitter, Globe, Quote
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { getProfilePhoto } from '@/lib/avatars';
import heroImg from '@/assets/growImage/seedHero2.png';
import seedAbout1 from '@/assets/growImage/seedAbout1.png';
import seedAbout2 from '@/assets/growImage/seedAbout2.png';

type Competition = {
  id: string; title: string; edition: string | null;
  description: string | null; event_date: string | null; status: string;
};

type Candidate = {
  id: string; competition_id: string; entrepreneur_id: string;
  raising_for: string | null;
  entrepreneur: any;
};

type Alumni = any;

const heroSlides = [
  {
    eyebrow: 'GROW WOMEN SEED FUND • 2026 EDITION',
    title: ['Watch. Vote.', 'She rises.'],
    accent: 'Support.',
    text: 'Six exceptional women entrepreneurs from Africa and Asia pitch live for seed funding, mentorship, and a global stage.',
  },
  {
    eyebrow: 'A LAUNCHPAD FOR WOMEN-LED BUSINESS',
    title: ['Capital is the spark.', 'Community is the fire.'],
    accent: 'Together,',
    text: 'Every candidate receives seed capital, world-class mentorship, investment readiness training and a lifelong network.',
  },
  {
    eyebrow: 'POWERED BY GLOBAL VOLUNTEERS',
    title: ['Invest in a woman.', 'a community.'],
    accent: 'Transform',
    text: 'Delivered with Linklaters, BCG, London Business School, LSE and a network of expert coaches from around the world.',
  },
];

const heroStats = [
  { v: '2', l: 'Seed Fund Editions' },
  { v: '9', l: 'Grants Awarded' },
  { v: '600+', l: 'Entrepreneurs Supported' },
  { v: '40+', l: 'Countries Reached' },
];

const supportPillars = [
  { icon: Sparkles, title: 'Business Development', text: 'Practical training to strengthen operations and growth.' },
  { icon: Trophy,   title: 'Investment Readiness', text: 'Get pitch and fundraising ready with experts.' },
  { icon: Users,    title: 'Mentorship & Coaching', text: '1:1 coaching from global volunteer leaders.' },
  { icon: Award,    title: 'Leadership Building',  text: 'Confidence, storytelling and decision making.' },
];

const partners = [
  { name: 'Linklaters', desc: 'Global law firm — strategic legal partner' },
  { name: 'Boston Consulting Group', desc: 'Strategy & business development support' },
  { name: 'London Business School', desc: 'Academic excellence & mentorship' },
  { name: 'London School of Economics', desc: 'Research partner & talent pipeline' },
  { name: 'CBS & CEMS', desc: 'European business school network' },
  { name: 'National Community Investment Fund', desc: 'Investment readiness partner' },
];

const partnerTracks = [
  {
    icon: Building2,
    title: 'Companies & Firms',
    text: 'Collaborate with us to transform employee expertise into leadership development and social impact. Engage employees through meaningful skills-based global volunteering that advances talent development, ESG, and impact goals.',
  },
  {
    icon: Briefcase,
    title: 'Professionals & Volunteer Coaches',
    text: 'Use your skills to create meaningful impact while developing your own leadership capabilities. Mentor ambitious entrepreneurs, build coaching and cross-cultural skills, expand your global perspective.',
  },
  {
    icon: GraduationCap,
    title: 'Universities & Students',
    text: 'Apply classroom learning to real-world challenges while developing leadership, consulting and communication skills. Gain hands-on experience supporting entrepreneurs and social enterprises.',
  },
  {
    icon: Lightbulb,
    title: 'Foundations, Grant Makers & Investors',
    text: 'Support high-potential entrepreneurs creating economic and social impact. Partner through grants, sponsorship, impact investment, or funding that helps businesses grow and scale.',
  },
];

const testimonials = [
  { q: 'Being part of the Grow Movement Seed Fund was transformational.', who: ' Keren Uhiriwe, 2025 finalist' },
  { q: "Beyond the opportunity itself, the connections, encouragement, and practical business support gave me the confidence to take my business to the next level.", who: 'Nadege Umuhire, 2025  finalist' },
];

function socialIcon(url: string) {
  const u = url.toLowerCase();
  if (u.includes('facebook')) return Facebook;
  if (u.includes('linkedin')) return Linkedin;
  if (u.includes('instagram')) return Instagram;
  if (u.includes('twitter') || u.includes('x.com')) return Twitter;
  return Globe;
}

function parseSocials(raw: any): string[] {
  if (!raw) return [];
  try {
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(v)) return v.map((x: any) => (typeof x === 'string' ? x : x?.url || x?.link)).filter(Boolean);
    return [];
  } catch { return []; }
}

export default function SeedFund() {
  const [comp, setComp] = useState<Competition | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);

  const [voteOpen, setVoteOpen] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form');
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCand, setDetailsCand] = useState<Candidate | null>(null);

  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlideIdx((i) => (i + 1) % heroSlides.length), 6500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { (async () => {
    setLoading(true);
    const { data: comps } = await (supabase as any)
      .from('seed_fund_competitions')
      .select('*')
      .in('status', ['active', 'ended'])
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(1);
    const c = comps?.[0] || null;
    setComp(c as any);

    if (c) {
      const { data: cands } = await (supabase as any)
        .from('seed_fund_candidates')
        .select('id, competition_id, entrepreneur_id, raising_for, display_order, entrepreneur:entrepreneurs(*)')
        .eq('competition_id', c.id)
        .order('display_order', { ascending: true });
      setCandidates((cands || []) as any);

      const { data: tally } = await (supabase as any).rpc('get_seed_fund_vote_counts', { _competition_id: c.id });
      const map: Record<string, number> = {};
      (tally || []).forEach((r: any) => { map[r.candidate_id] = Number(r.votes || 0); });
      setCounts(map);
    }

    const { data: alums } = await (supabase as any)
      .from('entrepreneurs')
      .select('*')
      .eq('status', 'Seed Fund Alumni')
      .order('created_at', { ascending: false });
    setAlumni(alums || []);
    setLoading(false);
  })(); }, []);

  const totalVotes = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const isActive = comp?.status === 'active';

  const openVote = (c: Candidate) => { setSelected(c); setStep('form'); setOtp(''); setVoteOpen(true); };
  const openDetails = (c: Candidate) => { setDetailsCand(c); setDetailsOpen(true); };

  const requestOtp = async () => {
    if (!selected || !comp) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(voterEmail)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email.', variant: 'destructive' });
      return;
    }
    setSending(true);
    const { data, error } = await (supabase as any).functions.invoke('request-vote-otp', {
      body: { competition_id: comp.id, candidate_id: selected.id, email: voterEmail.trim(), voter_name: voterName.trim() || null },
    });
    setSending(false);
    if (error || (data as any)?.error) {
      toast({ title: 'Could not send code', description: (data as any)?.error || error?.message, variant: 'destructive' });
      return;
    }
    if ((data as any)?.dev_code) {
      toast({ title: 'Dev code (email not configured)', description: `OTP: ${(data as any).dev_code}` });
    } else {
      toast({ title: 'Code sent', description: `Check ${voterEmail} for your 6-digit code.` });
    }
    setStep('otp');
  };

  const submitVote = async () => {
    if (!comp) return;
    if (!/^\d{6}$/.test(otp)) { toast({ title: 'Enter the 6-digit code', variant: 'destructive' }); return; }
    setSending(true);
    const { data, error } = await (supabase as any).functions.invoke('verify-vote-otp', {
      body: { competition_id: comp.id, email: voterEmail.trim(), code: otp.trim() },
    });
    setSending(false);
    if (error || (data as any)?.error) {
      toast({ title: 'Verification failed', description: (data as any)?.error || error?.message, variant: 'destructive' });
      return;
    }
    setStep('done');
    const { data: tally } = await (supabase as any).rpc('get_seed_fund_vote_counts', { _competition_id: comp.id });
    const map: Record<string, number> = {};
    (tally || []).forEach((r: any) => { map[r.candidate_id] = Number(r.votes || 0); });
    setCounts(map);
  };

  const resetVote = () => { setVoterName(''); setVoterEmail(''); setOtp(''); setStep('form'); };

  const e = detailsCand?.entrepreneur || {};
  const detailsSocials = parseSocials(e.social_media_links);

  return (
    <div className="bg-background text-foreground">
      {/* ========= CINEMATIC HERO with rotating content ========= */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <motion.img
            src={heroImg} alt="Women entrepreneurs"
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-grow-navy/95 via-grow-navy/80 to-grow-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-grow-navy via-transparent to-transparent" />
        </motion.div>

        <motion.div className="absolute top-1/3 right-10 w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, var(--grow-coral), transparent 70%)' }}
          animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-20 left-10 w-60 h-60 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, var(--grow-teal), transparent 70%)' }}
          animate={{ y: [0, 25, 0] }} transition={{ duration: 9, repeat: Infinity }} />

        <div className="container mx-auto px-6 lg:px-8 relative z-10 py-32">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIdx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-grow-gold" />
                  {heroSlides[slideIdx].eyebrow}
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                  {heroSlides[slideIdx].title[0]} <span className="text-grow-coral">{heroSlides[slideIdx].accent}</span><br />
                  <span className="text-grow-gold">{heroSlides[slideIdx].title[1]}</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                  {heroSlides[slideIdx].text}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#candidates">
                <Button size="lg" className="bg-grow-coral hover:bg-grow-coral/90 text-white shadow-2xl shadow-grow-coral/40">
                  <Vote className="mr-1" /> {isActive ? 'Vote a Candidate' : 'See the Candidates'}
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-white/5 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-grow-navy">
                  <Mail className="mr-1" /> Contact Us
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-white/85 text-sm">
              {comp?.event_date && (
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-grow-gold" />
                  {new Date(comp.event_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              )}
              <div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-grow-teal" /> Africa • Asia</div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-grow-gold'}`} />
                {isActive ? 'Voting is OPEN' : comp?.status === 'ended' ? 'Competition Ended' : 'Coming Soon'}
              </div>
            </div>

            {/* slide indicators */}
            <div className="mt-8 flex gap-2">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setSlideIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === slideIdx ? 'w-10 bg-grow-coral' : 'w-5 bg-white/30 hover:bg-white/60'}`}
                  aria-label={`Slide ${i+1}`} />
              ))}
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* ========= ANIMATED IMPACT STATS ========= */}
      <section className="py-16 md:py-20 bg-card border-y border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.3em] text-grow-coral uppercase mb-3">Seed Fund & Grow Movement Impact</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Measurable, growing, global.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {heroStats.map((s, i) => (
              <motion.div key={s.l}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6 }}
                className="relative bg-gradient-to-br from-background to-secondary rounded-2xl p-6 text-center border border-border overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-grow-coral/0 to-grow-coral/0 group-hover:from-grow-coral/5 group-hover:to-grow-gold/10 transition-all" />
                <div className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-br from-grow-coral to-grow-gold bg-clip-text text-transparent relative">
                  {s.v}
                </div>
                <div className="text-sm text-muted-foreground mt-1 relative">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= ABOUT PROGRAMME + images ========= */}
      <section className="py-24">
        <div className="container mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-xs font-semibold tracking-[0.3em] text-grow-coral uppercase mb-3">About the Programme</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
              More than seed capital — a launchpad for women-led businesses.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Delivered by Grow Movement in partnership with Linklaters, the Grow Women Seed Fund
              supports women entrepreneurs and startup founders from Africa and Asia with seed grants,
              mentorship, investment readiness training and leadership development.
            </p>
            <div className="space-y-4 mb-8">
              {testimonials.map((t) => (
                <blockquote key={t.who} className="relative bg-card border border-border rounded-2xl p-5 pl-12">
                  <Quote className="absolute top-4 left-4 h-5 w-5 text-grow-coral" />
                  <p className="italic text-foreground/85">"{t.q}"</p>
                  <div className="mt-2 text-sm text-muted-foreground">— {t.who}</div>
                </blockquote>
              ))}
            </div>
            <a href="#candidates"><Button className="bg-grow-coral hover:bg-grow-coral/90 text-white">Meet the candidates <ArrowRight className="ml-1 h-4 w-4" /></Button></a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative h-[520px]">
            <motion.div
              className="absolute top-0 right-0 w-3/4 h-72 rounded-3xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.03, rotate: 1 }}
            >
              <img src={seedAbout1} alt="Pitch event" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute bottom-0 left-0 w-2/3 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-background"
              whileHover={{ scale: 1.03, rotate: -1 }}
            >
              <img src={seedAbout2} alt="Entrepreneur" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-grow-coral text-white rounded-2xl p-5 shadow-2xl max-w-[180px]"
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="font-display text-3xl font-bold">$30K+</div>
              <div className="text-xs opacity-90">in seed grants awarded across editions</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========= CANDIDATES ========= */}
      <section id="candidates" className="py-24 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 max-w-3xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.3em] text-grow-coral uppercase mb-3">Candidates</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Meet the {comp?.edition || '2026'} Candidates</h2>
            <p className="text-muted-foreground text-lg">
              Explore their journeys, businesses, impact, and aspirations for future growth.
            </p>
          </motion.div>

          {/* How to vote */}
          <div className="max-w-3xl mx-auto mb-12 bg-background border border-border rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-grow-coral/10 flex items-center justify-center shrink-0">
              <Vote className="h-5 w-5 text-grow-coral" />
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">How voting works: </span>
              Click <em>Vote</em> on your favourite candidate, enter your email and the 6-digit code we send you.
              One vote per email. Voting is open until the live pitch event.
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin h-8 w-8 text-grow-coral" /></div>
          ) : !comp ? (
            <div className="text-center text-muted-foreground py-12">No competition has been published yet.</div>
          ) : !isActive ? (
            <div className="max-w-2xl mx-auto bg-background border border-border rounded-2xl p-10 text-center">
              <Trophy className="h-12 w-12 text-grow-gold mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">The competition has ended</h3>
              <p className="text-muted-foreground">Thank you to everyone who watched and voted.</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">Candidates will be announced shortly.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {candidates.map((c, i) => {
                const en = c.entrepreneur || {};
                const v = counts[c.id] || 0;
                const pct = totalVotes ? Math.round((v / totalVotes) * 100) : 0;
                const socials = parseSocials(en.social_media_links);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                    whileHover={{ y: -6 }}
                    className="group relative bg-background rounded-3xl overflow-hidden border border-border hover:border-grow-coral/40 hover:shadow-2xl transition-all flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden bg-muted">
                      <img
                        src={getProfilePhoto(en.photo_url, en.gender)}
                        alt={en.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-grow-navy/80 via-grow-navy/10 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-grow-gold text-grow-navy shadow">Candidate</span>
                        {en.country && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/95 text-grow-navy shadow">{en.country}</span>}
                      </div>
                      <div className="absolute bottom-0 p-4 text-white">
                        <div className="text-[10px] uppercase tracking-widest opacity-80">{en.sector}</div>
                        <h3 className="font-display text-xl font-bold leading-tight">{en.name}</h3>
                        <div className="text-xs opacity-90">{en.business_name}</div>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      {/* Quick info */}
                      <div className="space-y-2 mb-3 text-xs text-muted-foreground">
                        {en.about_entrepreneur && (
                          <div><span className="font-semibold text-foreground">Story: </span>{String(en.about_entrepreneur).slice(0, 90)}{en.about_entrepreneur.length > 90 ? '…' : ''}</div>
                        )}
                        {(en.business_description || en.products_services) && (
                          <div><span className="font-semibold text-foreground">Business: </span>{String(en.business_description || en.products_services).slice(0, 90)}{(en.business_description || en.products_services).length > 90 ? '…' : ''}</div>
                        )}
                        {en.impact && (
                          <div><span className="font-semibold text-foreground">Impact: </span>{String(en.impact).slice(0, 80)}{en.impact.length > 80 ? '…' : ''}</div>
                        )}
                        {c.raising_for && (
                          <div><span className="font-semibold text-foreground">Raising for: </span>{c.raising_for}</div>
                        )}
                      </div>

                      {/* Socials */}
                      {socials.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {socials.slice(0, 4).map((url, idx) => {
                            const I = socialIcon(url);
                            return (
                              <a key={idx} href={url} target="_blank" rel="noreferrer"
                                className="w-7 h-7 rounded-full bg-muted hover:bg-grow-coral hover:text-white flex items-center justify-center transition-colors"
                                aria-label="Social link"
                              >
                                <I className="h-3.5 w-3.5" />
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {/* Vote bar */}
                      <div className="mb-4 mt-auto">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{v} {v === 1 ? 'vote' : 'votes'}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-grow-coral to-grow-gold"
                            initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }} transition={{ duration: 0.9, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => openDetails(c)}>
                          Read more
                        </Button>
                        <Button className="flex-1 bg-grow-coral hover:bg-grow-coral/90" onClick={() => openVote(c)}>
                          <Vote /> Vote
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========= SUPPORT PILLARS ========= */}
      <section className="py-24 bg-grow-navy text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.3em] text-grow-gold uppercase mb-3">More Than Seed Capital</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">What every entrepreneur receives</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportPillars.map((p, i) => (
              <motion.div key={p.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-grow-coral/20 flex items-center justify-center mb-4">
                  <p.icon className="h-6 w-6 text-grow-coral" />
                </div>
                <h3 className="font-display text-lg mb-1">{p.title}</h3>
                <p className="text-sm text-white/70">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= PARTNERS — sliding marquee ========= */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase mb-3">In Partnership With</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">World-class partners powering the programme</h2>
        </div>
        <div className="relative">
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, -1200] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...partners, ...partners, ...partners].map((p, i) => (
              <div key={i} className="shrink-0 w-72 bg-card border border-border rounded-2xl p-6 hover:border-grow-coral/40 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-grow-coral/20 to-grow-gold/20 flex items-center justify-center mb-3">
                  <span className="font-display font-bold text-grow-coral">{p.name.charAt(0)}</span>
                </div>
                <h4 className="font-display font-bold text-foreground mb-1">{p.name}</h4>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========= ALUMNI ========= */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.3em] text-grow-coral uppercase mb-3">Alumni Entrepreneurs</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">The impact, in their own words</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Past candidates tell us how the seed fund transformed their businesses.
            </p>
          </div>

          {alumni.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">Alumni stories are coming soon.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map((a, i) => (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="bg-background rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-grow-teal/40 transition-all"
                >
                  <Link to={`/entrepreneurs/${a.id}`}>
                    <div className="flex gap-4 p-5">
                      <img src={getProfilePhoto(a.photo_url, a.gender)} alt={a.name}
                        className="h-20 w-20 rounded-2xl object-cover flex-shrink-0" loading="lazy" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-grow-teal">Seed Fund Alumna</span>
                        <h3 className="font-display font-bold text-foreground truncate">{a.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{a.business_name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" /> {a.country}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground italic border-l-2 border-grow-coral pl-3 line-clamp-3">
                      "{a.impact || a.pitch_summary || `The seed fund helped ${a.name?.split(' ')[0] || 'her'} expand operations, hire team members, and reach new markets — turning a dream into a thriving business.`}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========= PARTNER WITH GROW MOVEMENT — premium banner ========= */}
      <section className="relative py-28 overflow-hidden bg-gradient-to-br from-grow-navy via-grow-navy to-[#1f1530] text-white">
        <motion.div className="absolute -top-32 left-1/4 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, var(--grow-coral), transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 60, 0] }} transition={{ duration: 18, repeat: Infinity }} />
        <motion.div className="absolute -bottom-32 right-0 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, var(--grow-gold), transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 14, repeat: Infinity }} />

        <div className="container mx-auto px-6 lg:px-8 relative z-10 max-w-6xl">
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold tracking-widest uppercase"
            >
              <Sparkles className="h-3.5 w-3.5 text-grow-gold" /> Partner With Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="font-display text-4xl md:text-6xl font-bold mt-5 leading-tight"
            >
              Partner with <span className="bg-gradient-to-r from-grow-coral via-grow-gold to-white bg-clip-text text-transparent">Grow Movement</span>
            </motion.h2>
            <p className="mt-5 text-white/85 max-w-2xl mx-auto text-lg">
              Whether you're a company, university, foundation, investor, mentor or volunteer coach — we'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {partnerTracks.map((t, i) => (
              <motion.div key={t.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
                whileHover={{ y: -4 }}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-6 hover:bg-white/10 hover:border-grow-coral/40 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-grow-coral/10 to-grow-gold/10 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-grow-coral/20 flex items-center justify-center mb-4">
                    <t.icon className="h-6 w-6 text-grow-coral" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{t.title}</h3>
                  <p className="text-sm text-white/75 leading-relaxed">{t.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-grow-navy hover:bg-grow-gold hover:text-grow-navy shadow-2xl gap-2">
                <Mail className="h-5 w-5" /> Contact Us
              </Button>
            </Link>
            <a href="#candidates">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/5 backdrop-blur text-white hover:bg-white hover:text-grow-navy gap-2">
                <Vote className="h-5 w-5" /> Vote our Candidates
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ========= CLOSING MESSAGE ========= */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="font-display text-3xl md:text-5xl font-bold leading-tight text-foreground"
          >
            Together, we don't simply fund businesses.{' '}
            <span className="bg-gradient-to-r from-grow-coral via-grow-gold to-grow-teal bg-clip-text text-transparent">
              We unlock potential, strengthen communities,
            </span>{' '}
            and empower the next generation of women entrepreneurs across Africa and Asia.
          </motion.p>
        </div>
      </section>

      {/* ========= VOTE MODAL ========= */}
      <Dialog open={voteOpen} onOpenChange={(o) => { setVoteOpen(o); if (!o) resetVote(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vote for {selected?.entrepreneur?.name}</DialogTitle>
            <DialogDescription>
              {step === 'form' && 'Enter your details. We will email you a 6-digit code to verify your vote.'}
              {step === 'otp'  && `Enter the 6-digit code we sent to ${voterEmail}.`}
              {step === 'done' && 'Thank you! Your vote has been counted.'}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Your name (optional)</label>
                  <Input value={voterName} onChange={e => setVoterName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email <span className="text-grow-coral">*</span></label>
                  <Input type="email" value={voterEmail} onChange={e => setVoterEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={resetVote}><RotateCcw className="h-4 w-4" /> Clear</Button>
                  <Button onClick={requestOtp} disabled={sending} className="bg-grow-coral hover:bg-grow-coral/90">
                    {sending ? <Loader2 className="animate-spin" /> : <ArrowRight />} Send code
                  </Button>
                </div>
              </motion.div>
            )}
            {step === 'otp' && (
              <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <Input
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric" placeholder="123456" className="text-center tracking-[0.5em] text-2xl"
                />
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep('form')}>Back</Button>
                  <Button onClick={submitVote} disabled={sending} className="bg-grow-coral hover:bg-grow-coral/90">
                    {sending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Submit vote
                  </Button>
                </div>
              </motion.div>
            )}
            {step === 'done' && (
              <motion.div key="d" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-grow-teal/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-grow-teal" />
                </div>
                <p className="font-semibold text-lg">Vote counted!</p>
                <p className="text-sm text-muted-foreground">Thank you for supporting {selected?.entrepreneur?.name}.</p>
                <Button className="mt-4" onClick={() => setVoteOpen(false)}>Close</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* ========= CANDIDATE DETAILS DRAWER ========= */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {detailsCand && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">{e.name}</SheetTitle>
                <SheetDescription>{e.business_name} • {e.country}</SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-5">
                <img src={getProfilePhoto(e.photo_url, e.gender)} alt={e.name} className="w-full h-64 object-cover rounded-2xl" />
                {e.about_entrepreneur && (<div><h4 className="font-display font-bold mb-1">Founder Story</h4><p className="text-sm text-muted-foreground leading-relaxed">{e.about_entrepreneur}</p></div>)}
                {(e.business_description || e.products_services) && (<div><h4 className="font-display font-bold mb-1">Business Summary</h4><p className="text-sm text-muted-foreground leading-relaxed">{e.business_description || e.products_services}</p></div>)}
                {e.impact && (<div><h4 className="font-display font-bold mb-1">Measurable Impact</h4><p className="text-sm text-muted-foreground leading-relaxed">{e.impact}</p></div>)}
                {detailsCand.raising_for && (<div><h4 className="font-display font-bold mb-1">Funding Purpose</h4><p className="text-sm text-muted-foreground leading-relaxed">{detailsCand.raising_for}</p></div>)}
                {detailsSocials.length > 0 && (
                  <div>
                    <h4 className="font-display font-bold mb-2">Social Links</h4>
                    <div className="flex gap-2 flex-wrap">
                      {detailsSocials.map((url, idx) => {
                        const I = socialIcon(url);
                        return (
                          <a key={idx} href={url} target="_blank" rel="noreferrer"
                            className="px-3 py-1.5 rounded-full bg-muted hover:bg-grow-coral hover:text-white flex items-center gap-1.5 text-xs transition-colors">
                            <I className="h-3.5 w-3.5" /> Visit
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-3">
                  <Link to={`/entrepreneurs/${e.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Full profile <ChevronRight className="h-4 w-4" /></Button>
                  </Link>
                  <Button className="flex-1 bg-grow-coral hover:bg-grow-coral/90" onClick={() => { setDetailsOpen(false); openVote(detailsCand); }}>
                    <Vote /> Vote
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
