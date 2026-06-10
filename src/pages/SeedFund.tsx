import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Award, Calendar, Globe2, Mail, MapPin, Sparkles, Trophy,
  Users, ArrowRight, CheckCircle2, Vote, Loader2, RotateCcw,
  Briefcase, Building2, GraduationCap, Lightbulb, ChevronDown,
  ChevronRight, Facebook, Linkedin, Instagram, Twitter, Globe, Quote,
  X, KeyRound, ChevronUp, Heart, TrendingUp, Handshake, Radio, Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { getProfilePhoto } from '@/lib/avatars';
import heroImg from '@/assets/growImage/homeStory1.png';
import seedAbout1 from '@/assets/growImage/seedAbout1.png';
import seedAbout2 from '@/assets/growImage/seedAbout2.png';

type Competition = {
  id: string; title: string; edition: string | null;
  description: string | null; event_date: string | null; status: string;
  auth_method: 'otp' | 'private_code' | 'public_code';
  max_selections: number;
  public_code: string | null;
};

type Candidate = {
  id: string; competition_id: string; entrepreneur_id: string;
  raising_for: string | null;
  entrepreneur: any;
};

type Alumni = any;

const heroSlides = [
  {
    eyebrow: '',
    title: ['Watch. Vote.'],
    accent: 'Support.',
    text: ' women entrepreneurs from Africa and Asia pitch live for seed funding, mentorship, and a global stage.',
  },
  {
    eyebrow: '',
    title: ['Capital is the spark.', ''],
    accent: '',
    text: 'Every candidate receives seed capital, world-class mentorship, investment readiness training and a lifelong network.',
  },
  {
    eyebrow: '',
    title: ['Invest in a woman.', 'a community.'],
    accent: 'Transform',
    text: '',
  },
];

const heroStats = [
  { v: '2', l: 'Seed Fund Editions' },
  { v: '9', l: 'Grants Awarded' },
  { v: '600+', l: 'Entrepreneurs Supported' },
  { v: '40+', l: 'Countries Reached' },

  // { v: '4,000+', l: 'Entrepreneurs coached' },
  // { v: '60,000+', l: 'Jobs collectively created' },
  // { v: '7,000+', l: 'Consultants and students engaged' },
  // { v: '2,000+', l: 'Corporate coaches worldwide' },
  // { v: '2,000+', l: 'Corporate coaches worldwide' },
];

const supportPillars = [
  { icon: Sparkles, title: 'Business Development', text: 'Practical training to strengthen operations and growth.' },
  { icon: Trophy,   title: 'Investment Readiness', text: 'Get pitch and fundraising ready with experts.' },
  { icon: Users,    title: 'Mentorship & Coaching', text: '1:1 coaching from global volunteer leaders.' },
  { icon: Award,    title: 'Leadership Building',  text: 'Confidence, storytelling and decision making.' },
];

// Partner logos — drop image files into /public/partners or replace logoUrl with your own asset.
const partners = [
  { name: 'Linklaters', logoUrl: '/partners/linklaters.png', desc: 'Global law firm — strategic legal partner' },
  { name: 'Boston Consulting Group', logoUrl: '/partners/bcg.png', desc: 'Strategy & business development support' },
  { name: 'London Business School', logoUrl: '/partners/lbs.png', desc: 'Academic excellence & mentorship' },
  { name: 'London School of Economics', logoUrl: '/partners/lse.png', desc: 'Research partner & talent pipeline' },
  { name: 'Copenhagen Business School', logoUrl: '/partners/cbs.png', desc: 'European business school network' },
  { name: 'CEMS', logoUrl: '/partners/cems.png', desc: 'Global alliance in management education' },
  { name: 'National Community Investment Fund', logoUrl: '/partners/ncif.png', desc: 'Investment readiness partner' },
];

// Programme-wide animated impact stats (shown under candidate catalog)
const impactStats = [
  { v: 4000,   suffix: '+', l: 'Entrepreneurs coached' },
  { v: 60000,  suffix: '+', l: 'Jobs collectively created' },
  { v: 7000,   suffix: '+', l: 'Consultants & students engaged' },
  { v: 2000,   suffix: '+', l: 'Corporate coaches worldwide' },
  { v: 13,     suffix: '',  l: 'Countries across Africa & Asia' },
  { v: 60,     suffix: '+', l: 'Countries represented by coaches & students' },
  { v: 10,     suffix: '',  l: 'Global university partnerships' },
  { v: 15,     suffix: '',  l: 'Women entrepreneurs we invested in' },
  { v: 150,    suffix: '+', l: 'Annual attendees at our Live Pitch' },
];

function formatStat(n: number) {
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{formatStat(n)}{suffix}</span>;
}

const partnerTracks = [
  {
    icon: Building2,
    title: 'Companies & Firms',
    text: 'Collaborate with us to transform employee expertise into leadership development and social impact. Grow Movement helps organisations engage employees through meaningful skills-based global volunteering that advances talent development, employee engagement, ESG, and social impact goals.',
  },
  {
    icon: Briefcase,
    title: 'Professionals & Volunteer Coaches',
    text: 'Use your skills to create meaningful impact while developing your own leadership capabilities. Mentor ambitious entrepreneurs, build coaching and cross-cultural skills, expand your global perspective, and help businesses create jobs and economic opportunity.',
  },
  {
    icon: GraduationCap,
    title: 'Universities & Students',
    text: 'Apply classroom learning and frameworks to real-world challenges while developing leadership, consulting, cross-cultural, and communication skills. Students gain hands-on experience supporting entrepreneurs and social enterprises while building the capabilities needed to thrive in a global workforce.',
  },
  {
    icon: Lightbulb,
    title: 'Foundations, Grant Makers & Investors',
    text: 'Support high-potential entrepreneurs creating economic and social impact. Partner with Grow Movement through grants, sponsorship, impact investment, or funding opportunities that help businesses grow and scale.',

  },
];

const testimonials = [
  
  { q: "I gained the confidence to present my business effectively to stakeholders and investors. I learned how to communicate my vision with clarity, strengthen my pitch, and develop professional fundraising materials. The mentorship and support encouraged me to think beyond my current challenges and envision greater possibilities for the growth and impact of our company and the families we serve.", who: 'Nadege Umuhire, Founder of Nutricela Ltd, based in Rwanda' },
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
  const navigate = useNavigate();
  const [comp, setComp] = useState<Competition | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  // Voter selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Voting modal
  const [voteOpen, setVoteOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form');
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [code, setCode] = useState('');
  const [voteToken, setVoteToken] = useState('');
  const [sending, setSending] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCand, setDetailsCand] = useState<Candidate | null>(null);

  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlideIdx((i) => (i + 1) % heroSlides.length), 9000);
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
      .from('entrepreneurs').select('*').eq('status', 'Seed Fund Alumni')
      .order('created_at', { ascending: false });
    setAlumni(alums || []);
    setLoading(false);
  })(); }, []);

  // Realtime vote counts
  useEffect(() => {
    if (!comp?.id) return;
    const ch = (supabase as any).channel(`votes-${comp.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seed_fund_votes', filter: `competition_id=eq.${comp.id}` },
        async () => {
          const { data: tally } = await (supabase as any).rpc('get_seed_fund_vote_counts', { _competition_id: comp.id });
          const map: Record<string, number> = {};
          (tally || []).forEach((r: any) => { map[r.candidate_id] = Number(r.votes || 0); });
          setCounts(map);
        }).subscribe();
    return () => { (supabase as any).removeChannel(ch); };
  }, [comp?.id]);

  const totalVotes = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const isActive = comp?.status === 'active';
  const maxSel = comp?.max_selections ?? 1;
  const exactReady = selectedIds.length === maxSel;
  const authMethod = comp?.auth_method || 'otp';

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= maxSel) {
        toast({ title: `You can only select ${maxSel} candidate${maxSel === 1 ? '' : 's'}`, variant: 'destructive' });
        return prev;
      }
      return [...prev, id];
    });
  };

  const openDetails = (c: Candidate) => { setDetailsCand(c); setDetailsOpen(true); };

  const startVote = () => {
    if (!exactReady) {
      toast({ title: `Select exactly ${maxSel} candidate${maxSel === 1 ? '' : 's'}`, variant: 'destructive' });
      return;
    }
    setStep('form'); setOtp(''); setCode(''); setVoteToken(''); setVoteOpen(true);
  };

  const requestOtp = async () => {
    if (!comp) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(voterEmail)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email.', variant: 'destructive' });
      return;
    }
    setSending(true);
    const { data, error } = await (supabase as any).functions.invoke('request-vote-otp', {
      body: { competition_id: comp.id, email: voterEmail.trim(), voter_name: voterName.trim() || null },
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

  const submitOtpVote = async () => {
    if (!comp) return;
    if (!/^\d{6}$/.test(otp)) { toast({ title: 'Enter the 6-digit code', variant: 'destructive' }); return; }
    setSending(true);
    const { data, error } = await (supabase as any).functions.invoke('verify-vote-otp', {
      body: { competition_id: comp.id, email: voterEmail.trim(), code: otp.trim(), candidate_ids: selectedIds },
    });
    setSending(false);
    if (error || (data as any)?.error) {
      toast({ title: 'Verification failed', description: (data as any)?.error || error?.message, variant: 'destructive' });
      return;
    }
    setVoteToken((data as any)?.vote_token || '');
    setStep('done');
    setSelectedIds([]);
  };

  const submitCodeVote = async () => {
    if (!comp) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(voterEmail)) {
      toast({ title: 'Invalid email', variant: 'destructive' }); return;
    }
    if (!code.trim()) { toast({ title: 'Enter your code', variant: 'destructive' }); return; }
    setSending(true);
    const { data, error } = await (supabase as any).functions.invoke('cast-code-vote', {
      body: {
        competition_id: comp.id, email: voterEmail.trim(), voter_name: voterName.trim() || null,
        code: code.trim(), candidate_ids: selectedIds,
      },
    });
    setSending(false);
    if (error || (data as any)?.error) {
      toast({ title: 'Could not submit vote', description: (data as any)?.error || error?.message, variant: 'destructive' });
      return;
    }
    setVoteToken((data as any)?.vote_token || '');
    setStep('done');
    setSelectedIds([]);
  };

  const resetVote = () => { setVoterName(''); setVoterEmail(''); setOtp(''); setCode(''); setStep('form'); };

  const e = detailsCand?.entrepreneur || {};
  const detailsSocials = parseSocials(e.social_media_links);
  const selectedCandObjs = candidates.filter(c => selectedIds.includes(c.id));

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
                  {/* <Sparkles className="h-3.5 w-3.5 text-grow-gold" /> */}
                 {/* / {heroSlides[slideIdx].eyebrow} */}
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
              <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-grow-gold" />Grand • Final</div>
              
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
            <p className="text-xs font-semibold tracking-[0.3em] text-grow-coral uppercase mb-3">The impact we can have together.
</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Your Impact. Our Footprint 
</h2>
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
              GROW Women Seed Fund
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Supporting women entrepreneurs across Africa and Asia with seed capital, grants, mentorship, investment readiness support, and leadership development opportunities.

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
            {/* <a href="#candidates"><Button className="bg-grow-coral hover:bg-grow-coral/90 text-white">Meet the candidates <ArrowRight className="ml-1 h-4 w-4" /></Button></a> */}
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
              <div className="font-display text-3xl font-bold">£30K+</div>
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
              Explore their journeys, businesses, impact, and aspirations for future growth. <br></br> <br></br>
              We have shortlisted 12 outstanding women entrepreneurs for the Semi-Final. 
Please review the candidates and select your top 4 to advance to the Live Zoom Pitch Final. 
The top 6 candidates will progress to the Pitch Final, where all finalists will receive seed capital grants. 

Through a live online pitch competition, participants present their businesses to panelists and a global audience. 

            </p>
          </motion.div>

          {/* How to vote */}
          <div className="max-w-3xl mx-auto mb-10 bg-background border border-border rounded-2xl p-6 grid sm:grid-cols-3 gap-4">
            {[
              { n: '1', t: 'Select', d: `Tick the box on ${maxSel} candidate${maxSel === 1 ? '' : 's'} you want to advance.` },
              { n: '2', t: authMethod === 'otp' ? 'Verify' : 'Enter code', d: authMethod === 'otp' ? 'Enter your email & the 6-digit code we send.' : 'Enter the voting code you received.' },
              { n: '3', t: 'Submit', d: 'Your ballot is recorded once. Live results update instantly.' },
            ].map(s => (
              <div key={s.n} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-grow-coral text-white font-bold flex items-center justify-center shrink-0">{s.n}</div>
                <div>
                  <div className="font-semibold text-sm">{s.t}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{s.d}</div>
                </div>
              </div>
            ))}
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32 lg:pb-12">
              {candidates.map((c, i) => {
                const en = c.entrepreneur || {};
                const v = counts[c.id] || 0;
                const pct = totalVotes ? Math.round((v / totalVotes) * 100) : 0;
                const socials = parseSocials(en.social_media_links);
                const isSelected = selectedIds.includes(c.id);
                const atLimit = !isSelected && selectedIds.length >= maxSel;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.06 }}
                    className={`group relative bg-background rounded-2xl overflow-hidden border-2 transition-all flex flex-col ${
                      isSelected ? 'border-grow-coral shadow-2xl shadow-grow-coral/20 ring-4 ring-grow-coral/10'
                                  : 'border-border hover:border-grow-coral/40 hover:shadow-xl'
                    }`}
                  >
                    {/* Top: select bar */}
                    <button
                      type="button"
                      onClick={() => toggleSelect(c.id)}
                      disabled={atLimit}
                      className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isSelected ? 'bg-grow-coral text-white' :
                        atLimit ? 'bg-muted text-muted-foreground cursor-not-allowed' :
                        'bg-background text-foreground hover:bg-grow-coral/5 border-b border-border'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Checkbox checked={isSelected} className={isSelected ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-grow-coral' : ''} />
                        {isSelected ? 'Selected' : atLimit ? `Limit reached (${maxSel})` : 'Select for Final Pitch'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-grow-gold/15 text-grow-gold'}`}>Top Candidate</span>
                    </button>

                    <div className="p-4 flex gap-3">
                      <img
                        src={getProfilePhoto(en.photo_url, en.gender)}
                        alt={en.name}
                        className="w-24 h-28 rounded-xl object-cover flex-shrink-0 shadow-sm"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-bold leading-tight truncate">{en.name}</h3>
                        {en.business_name && <p className="text-xs font-semibold text-foreground/85 truncate">{en.business_name}</p>}
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 truncate"><MapPin className="h-3 w-3" /> {en.country}</div>
                        {en.sector && <div className="text-[11px] font-medium text-grow-teal mt-1 truncate">{en.sector}</div>}
                        {en.about_entrepreneur && (
                          <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-snug">{en.about_entrepreneur}</p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4 flex flex-col flex-1 gap-2.5 text-xs">
                      {(en.business_description || en.products_services) && (
                        <div><span className="font-semibold text-foreground">Business: </span><span className="text-muted-foreground">{String(en.business_description || en.products_services).slice(0, 110)}{(en.business_description || en.products_services).length > 110 ? '…' : ''}</span></div>
                      )}
                      {en.impact && (
                        <div><span className="font-semibold text-foreground">Impact: </span><span className="text-muted-foreground">{String(en.impact).slice(0, 90)}{en.impact.length > 90 ? '…' : ''}</span></div>
                      )}
                      {c.raising_for && (
                        <div><span className="font-semibold text-foreground">Raising for: </span><span className="text-muted-foreground">{c.raising_for}</span></div>
                      )}

                      {socials.length > 0 && (
                        <div className="flex gap-1.5 mt-1">
                          {socials.slice(0, 4).map((url, idx) => {
                            const I = socialIcon(url);
                            return (
                              <a key={idx} href={url} target="_blank" rel="noreferrer"
                                className="w-6 h-6 rounded-full bg-muted hover:bg-grow-coral hover:text-white flex items-center justify-center transition-colors"
                                aria-label="Social link" onClick={(e) => e.stopPropagation()}
                              >
                                <I className="h-3 w-3" />
                              </a>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                          <span>{v} {v === 1 ? 'vote' : 'votes'}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-grow-coral to-grow-gold"
                            initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }} transition={{ duration: 0.9, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => openDetails(c)}>
                        Read more <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
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
          <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground   uppercase mb-3">Grow Women Fund Partners</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold"> In Partnership With</h2>
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
            <p className="text-xs font-semibold tracking-[0.3em] text-grow-coral uppercase mb-3"> Grow Women Seed Fund Alumni</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Meet Past Funded Alumni Entrepreneurs</h2>
            {/* <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Past candidates tell us how the seed fund transformed their businesses.
            </p> */}
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
               Create Jobs and Social Impact with us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="font-display text-4xl md:text-6xl font-bold mt-5 leading-tight"
            >
              About  <span className="bg-gradient-to-r from-grow-coral via-grow-gold to-white bg-clip-text text-transparent">Grow Movement</span>
            </motion.h2>
            <p className="mt-5 text-white/85 max-w-2xl mx-auto text-lg">
              Trusted by Leading Global Corporate Organisations and Universities
Grow Movement partners with leading companies for example and universities to deliver social impact, leadership development, and entrepreneur mentoring programmes that create measurable results for both professionals and entrepreneurs. 

            </p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="font-display text-4xl md:text-6xl font-bold mt-5 leading-tight"
            >
              Partner with  <span className="bg-gradient-to-r from-grow-coral via-grow-gold to-white bg-clip-text text-transparent">Grow Movement</span>
            </motion.h2>
            <p className="mt-5 text-white/85 max-w-2xl mx-auto text-lg">
              Whether you're a company, university, foundation, investor, mentor, volunteer coach, we'd love to hear from you.

Trusted by leading global organisations, including Boston Consulting Group, Linklaters, the National Community Investment Fund, London Business School, the London School of Economics, and Copenhagen Business School.
Through Grow Movement, company professionals and university students coach and advise small businesses in emerging markets, creating jobs and economic opportunity while developing leadership, consulting, cross-cultural, and remote collaboration skills.

            </p>
             <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="font-display text-4xl md:text-6xl font-bold mt-5 leading-tight"
            >
              Benefits for   <span className="bg-gradient-to-r from-grow-coral via-grow-gold to-white bg-clip-text text-transparent">Partners</span>
            </motion.h2>
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
      {/* <section className="py-24 bg-background">
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
      </section> */}

      {/* ========= STICKY VOTING INDICATOR ========= */}
      {isActive && (
        <>
          {/* Desktop floating panel */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="hidden lg:flex fixed bottom-6 right-6 z-40 w-80 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex-col overflow-hidden"
          >
            <div className="px-4 py-3 bg-grow-navy text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">Your Selections</div>
                <div className="font-display font-bold text-lg">{selectedIds.length} / {maxSel}</div>
              </div>
              <Vote className="h-5 w-5 text-grow-gold" />
            </div>
            <div className="p-3 max-h-56 overflow-y-auto space-y-2">
              {selectedCandObjs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  Tick candidates to add them here.
                </p>
              ) : selectedCandObjs.map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-background border border-border rounded-lg p-2">
                  <img src={getProfilePhoto(c.entrepreneur?.photo_url, c.entrepreneur?.gender)}
                    alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{c.entrepreneur?.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.entrepreneur?.business_name}</div>
                  </div>
                  <button onClick={() => toggleSelect(c.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              disabled={!exactReady} onClick={startVote}
              className="m-3 mt-1 bg-grow-coral hover:bg-grow-coral/90 disabled:bg-muted disabled:text-muted-foreground"
            >
              <CheckCircle2 className="h-4 w-4" /> Submit My Selections ({selectedIds.length}/{maxSel})
            </Button>
          </motion.aside>

          {/* Mobile bottom bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl">
            <button
              onClick={() => setMobileExpanded(v => !v)}
              className="w-full px-4 py-2.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Vote className="h-4 w-4 text-grow-coral" />
                {selectedIds.length} / {maxSel} selected
              </div>
              {mobileExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <AnimatePresence>
              {mobileExpanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border">
                  <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                    {selectedCandObjs.length === 0
                      ? <p className="text-xs text-muted-foreground text-center py-2">No selections yet.</p>
                      : selectedCandObjs.map(c => (
                          <div key={c.id} className="flex items-center gap-2 bg-background border border-border rounded-lg p-2">
                            <img src={getProfilePhoto(c.entrepreneur?.photo_url, c.entrepreneur?.gender)} alt="" className="w-7 h-7 rounded-full object-cover" />
                            <span className="text-xs flex-1 truncate">{c.entrepreneur?.name}</span>
                            <button onClick={() => toggleSelect(c.id)} aria-label="Remove"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          </div>
                        ))
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="p-2 border-t border-border">
              <Button disabled={!exactReady} onClick={startVote}
                className="w-full bg-grow-coral hover:bg-grow-coral/90 disabled:bg-muted disabled:text-muted-foreground">
                Submit ({selectedIds.length}/{maxSel})
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ========= VOTE MODAL ========= */}
      <Dialog open={voteOpen} onOpenChange={(o) => { setVoteOpen(o); if (!o) resetVote(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 'done' ? 'Vote submitted' : `Confirm your ${maxSel === 1 ? 'vote' : 'ballot'}`}
            </DialogTitle>
            <DialogDescription>
              {step === 'form' && (authMethod === 'otp'
                ? 'Enter your details. We will email you a 6-digit code to verify your vote.'
                : authMethod === 'public_code'
                  ? 'Enter your details and the public voting code shared with you.'
                  : 'Enter your details and the private one-time code that was sent to you.')}
              {step === 'otp' && `Enter the 6-digit code we sent to ${voterEmail}.`}
              {step === 'done' && 'Thank you — your ballot has been recorded.'}
            </DialogDescription>
          </DialogHeader>

          {step !== 'done' && (
            <div className="bg-muted/50 rounded-lg p-3 text-xs">
              <div className="font-semibold mb-1">Your selections ({selectedIds.length}/{maxSel}):</div>
              <ul className="space-y-0.5 text-muted-foreground">
                {selectedCandObjs.map(c => (
                  <li key={c.id}>• {c.entrepreneur?.name} <span className="opacity-60">— {c.entrepreneur?.business_name}</span></li>
                ))}
              </ul>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div>
                  <Label className="text-sm">Your name (optional)</Label>
                  <Input value={voterName} onChange={e => setVoterName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div>
                  <Label className="text-sm">Email <span className="text-grow-coral">*</span></Label>
                  <Input type="email" value={voterEmail} onChange={e => setVoterEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                {(authMethod === 'public_code' || authMethod === 'private_code') && (
                  <div>
                    <Label className="text-sm flex items-center gap-1"><KeyRound className="h-3.5 w-3.5" /> Voting code *</Label>
                    <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder={authMethod === 'public_code' ? 'GROW2026' : 'XXXX-XXXX-XXXX'}
                      className="font-mono tracking-wider" />
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={resetVote}><RotateCcw className="h-4 w-4" /> Clear</Button>
                  {authMethod === 'otp' ? (
                    <Button onClick={requestOtp} disabled={sending} className="bg-grow-coral hover:bg-grow-coral/90">
                      {sending ? <Loader2 className="animate-spin" /> : <ArrowRight />} Send code
                    </Button>
                  ) : (
                    <Button onClick={submitCodeVote} disabled={sending} className="bg-grow-coral hover:bg-grow-coral/90">
                      {sending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Submit ballot
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
            {step === 'otp' && (
              <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <Input
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric" placeholder="123456"
                  className="text-center tracking-[0.5em] text-2xl font-mono"
                />
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep('form')}>Back</Button>
                  <Button onClick={submitOtpVote} disabled={sending} className="bg-grow-coral hover:bg-grow-coral/90">
                    {sending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Submit ballot
                  </Button>
                </div>
              </motion.div>
            )}
            {step === 'done' && (
              <motion.div key="d" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-grow-teal/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-grow-teal" />
                </div>
                <p className="font-semibold text-lg">Ballot recorded!</p>
                <p className="text-sm text-muted-foreground">Thank you for taking part in {comp?.title}.</p>
                {voteToken && (
                  <p className="text-[11px] text-muted-foreground mt-3 font-mono break-all">
                    Reference: {voteToken}
                  </p>
                )}
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
                  {detailsCand && isActive && (
                    <Button className="flex-1 bg-grow-coral hover:bg-grow-coral/90"
                      onClick={() => { toggleSelect(detailsCand.id); setDetailsOpen(false); }}>
                      <CheckCircle2 className="h-4 w-4" />
                      {selectedIds.includes(detailsCand.id) ? 'Selected' : 'Select'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
