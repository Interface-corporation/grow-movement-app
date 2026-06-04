import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Calendar, Globe2, Heart, Mail, MapPin, Sparkles, Trophy,
  Users, ArrowRight, CheckCircle2, Vote, Loader2, RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { getProfilePhoto } from '@/lib/avatars';
import heroImg from '@/assets/seedfund-hero.jpg';

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

const partners = [
  'Linklaters', 'Boston Consulting Group', 'London Business School',
  'London School of Economics', 'National Community Investment Fund', 'CBS & CEMS',
];

const supportPillars = [
  { icon: Sparkles, title: 'Business Development', text: 'Practical training to strengthen operations and growth.' },
  { icon: Trophy,   title: 'Investment Readiness', text: 'Get pitch and fundraising ready with experts.' },
  { icon: Users,    title: 'Mentorship & Coaching', text: '1:1 coaching from global volunteer leaders.' },
  { icon: Award,    title: 'Leadership Building',  text: 'Confidence, storytelling and decision making.' },
];

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

  useEffect(() => { (async () => {
    setLoading(true);
    // active OR most recent ended competition
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

  const openVote = (c: Candidate) => {
    setSelected(c); setStep('form'); setOtp(''); setVoteOpen(true);
  };

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
    // refresh tally
    const { data: tally } = await (supabase as any).rpc('get_seed_fund_vote_counts', { _competition_id: comp.id });
    const map: Record<string, number> = {};
    (tally || []).forEach((r: any) => { map[r.candidate_id] = Number(r.votes || 0); });
    setCounts(map);
  };

  const resetVote = () => { setVoterName(''); setVoterEmail(''); setOtp(''); setStep('form'); };

  return (
    <div className="bg-background text-foreground">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img src={heroImg} alt="Women entrepreneur pitching" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-grow-navy/95 via-grow-navy/75 to-grow-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-grow-navy via-transparent to-transparent" />
        </motion.div>

        {/* floating accent */}
        <motion.div
          className="absolute top-1/3 right-10 w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, var(--grow-coral), transparent 70%)' }}
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-60 h-60 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, var(--grow-teal), transparent 70%)' }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container mx-auto px-6 lg:px-8 relative z-10 py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-3.5 w-3.5 text-grow-gold" />
              GROW WOMEN SEED FUND • {comp?.edition || '2026'} EDITION
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
              Watch. Vote. <span className="text-grow-coral">Support</span>.<br />
              <span className="text-grow-gold">She rises.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
              Six outstanding women entrepreneurs from across Africa and Asia pitch their businesses live.
              Cast your vote for the audience choice award and help shape who wins the seed fund grant.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#candidates">
                <Button size="lg" className="bg-grow-coral hover:bg-grow-coral/90 text-white shadow-2xl shadow-grow-coral/30">
                  <Vote className="mr-1" /> {isActive ? 'Vote a Candidate' : 'See the Candidates'}
                </Button>
              </a>
              <Link to="/donate">
                <Button size="lg" variant="outline" className="bg-white/5 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-grow-navy">
                  <Heart className="mr-1 fill-current" /> Support the Fund
                </Button>
              </Link>
            </div>

            {/* meta */}
            <div className="mt-10 flex flex-wrap gap-6 text-white/80 text-sm">
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
          </motion.div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-sm font-semibold tracking-widest text-grow-coral uppercase mb-3">About the Programme</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
              More than seed capital — a launchpad for women-led businesses.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Delivered by Grow Movement in partnership with Linklaters, the Grow Women Seed Fund supports
              women entrepreneurs and startup founders from Africa and Asia with seed grants, mentorship,
              investment readiness training and leadership development.
            </p>
            <blockquote className="mt-6 border-l-4 border-grow-coral pl-5 italic text-foreground/80">
              “Through the programme, I gained the confidence to present my business to investors and stakeholders.
              The mentorship encouraged me to envision greater possibilities for my company.”
              <div className="mt-2 not-italic text-sm text-muted-foreground">— Entrepreneur, 2025 Edition</div>
            </blockquote>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="grid grid-cols-2 gap-4">
            {[
              { v: '2', l: 'Editions Delivered' },
              { v: '9', l: 'Seed Grants Awarded' },
              { v: '150+', l: 'Global Audience' },
              { v: '3', l: 'Countries Reached' },
            ].map(s => (
              <div key={s.l} className="bg-background border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl font-display font-bold text-grow-coral">{s.v}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CANDIDATES */}
      <section id="candidates" className="py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest text-grow-coral uppercase mb-3">Meet the Candidates</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              The {comp?.edition || '2026'} cohort
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Explore their stories, businesses and visions for growth. {isActive ? 'Cast one vote per email — verified via OTP.' : ''}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin h-8 w-8 text-grow-coral" /></div>
          ) : !comp ? (
            <div className="text-center text-muted-foreground py-12">No competition has been published yet.</div>
          ) : !isActive ? (
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-10 text-center">
              <Trophy className="h-12 w-12 text-grow-gold mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">The competition has ended</h3>
              <p className="text-muted-foreground">Thank you to everyone who watched and voted. Discover the impact below in our Alumni section.</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">Candidates will be announced shortly.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {candidates.map((c, i) => {
                const e = c.entrepreneur || {};
                const v = counts[c.id] || 0;
                const pct = totalVotes ? Math.round((v / totalVotes) * 100) : 0;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                    whileHover={{ y: -8 }}
                    className="group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-grow-coral/40 hover:shadow-2xl transition-all"
                  >
                    <Link to={`/entrepreneurs/${e.id}`} className="block">
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        <img
                          src={getProfilePhoto(e.photo_url, e.gender)}
                          alt={e.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-grow-navy/95 via-grow-navy/20 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-grow-gold text-grow-navy">Candidate</span>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/90 text-grow-navy">{e.country}</span>
                        </div>
                        <div className="absolute bottom-0 p-5 text-white">
                          <div className="text-xs uppercase tracking-widest opacity-80">{e.sector}</div>
                          <h3 className="font-display text-2xl font-bold leading-tight">{e.name}</h3>
                          <div className="text-sm opacity-90">{e.business_name}</div>
                        </div>
                      </div>
                    </Link>

                    <div className="p-5">
                      {c.raising_for && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          <span className="font-semibold text-foreground">Raising for: </span>{c.raising_for}
                        </p>
                      )}
                      {/* vote bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{v} {v === 1 ? 'vote' : 'votes'}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-grow-coral to-grow-gold"
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/entrepreneurs/${e.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">View profile</Button>
                        </Link>
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

      {/* SUPPORT PILLARS */}
      <section className="py-24 bg-grow-navy text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest text-grow-gold uppercase mb-3">More Than Seed Capital</p>
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
                <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                <p className="text-sm text-white/70">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ALUMNI */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest text-grow-coral uppercase mb-3">Alumni Entrepreneurs</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">The impact, in their own words</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Meet the women who competed in past editions and discover how the seed fund transformed their businesses.
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
                        <h3 className="font-bold text-foreground truncate">{a.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{a.business_name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" /> {a.country}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {(a.impact || a.pitch_summary) && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-muted-foreground italic border-l-2 border-grow-coral pl-3 line-clamp-4">
                        “{a.impact || a.pitch_summary}”
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-6">In Partnership With</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {partners.map(p => (
              <span key={p} className="text-foreground/60 font-display font-semibold text-lg hover:text-grow-coral transition-colors">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-grow-coral via-grow-coral/95 to-grow-gold relative overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="container mx-auto px-6 lg:px-8 relative z-10 text-center text-white">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Invest in a woman. Transform a community.</h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">
            Your support powers seed grants, mentorship and the next generation of women-led businesses.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/donate">
              <Button size="lg" className="bg-white text-grow-coral hover:bg-white/90">
                <Heart className="fill-current" /> Donate to the Fund
              </Button>
            </Link>
            <a href="mailto:violet@growmovement.org">
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-grow-coral">
                <Mail /> Partner With Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* VOTE MODAL */}
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
    </div>
  );
}
