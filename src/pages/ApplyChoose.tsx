import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Sparkles, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApplyChoose() {
  const benefits = [
    'Free 1:1 coaching from global volunteers',
    'Live training & business development workshops',
    'Access to investor networks & seed funding',
    'A worldwide community of changemakers',
  ];

  return (
    <div className="bg-background text-foreground">
      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-grow-navy via-grow-navy to-grow-navy/90 text-white">
        <motion.div
          className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, var(--grow-coral), transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-[24rem] h-[24rem] rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, var(--grow-teal), transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 12, repeat: Infinity }}
        />
        <div className="container mx-auto px-6 lg:px-8 relative z-10 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
               JOIN GROW MOVEMENT
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
              Begin your <span className="text-grow-coral">journey</span> with us
            </h1>
            <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
              Grow Movement connects ambitious entrepreneurs in Africa and Asia with
              experienced volunteer coaches from around the world. Choose your path below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About application */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-xs font-semibold tracking-widest text-grow-coral uppercase mb-3">About the application</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">A single application. Two powerful pathways.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're building a business that creates jobs, or an experienced professional
                ready to share your expertise — Grow Movement matches you with the right people, programmes
                and tools to grow further, faster.
              </p>
            </div>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 bg-background border border-border rounded-xl p-4">
                  <CheckCircle2 className="h-5 w-5 text-grow-teal shrink-0 mt-0.5" />
                  <span className="text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Two Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-3">Choose your path</h2>
            <p className="text-muted-foreground">Select the application that fits you best.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Entrepreneur */}
            <motion.div whileHover={{ y: -6 }} className="group relative rounded-3xl overflow-hidden border border-border bg-card shadow-lg hover:shadow-2xl transition-all">
              <div className="h-2 bg-gradient-to-r from-grow-coral to-grow-gold" />
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-grow-coral/10 flex items-center justify-center mb-5">
                  <Briefcase className="h-7 w-7 text-grow-coral" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Apply as an Entrepreneur</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Have a registered or growing business? Get coaching, training and access to investors
                  to scale your impact.
                </p>
                <ul className="space-y-2 mb-7 text-sm text-muted-foreground">
                  <li>• You run an existing business in Africa or Asia</li>
                  <li>• You want 1:1 coaching and growth tools</li>
                  <li>• You're ready for investor introductions</li>
                </ul>
                <Link to="/apply/entrepreneur">
                  <Button size="lg" className="w-full bg-grow-coral hover:bg-grow-coral/90 text-white gap-2 group-hover:shadow-lg shadow-grow-coral/30">
                    Start Entrepreneur Application <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Coach */}
            <motion.div whileHover={{ y: -6 }} className="group relative rounded-3xl overflow-hidden border border-border bg-card shadow-lg hover:shadow-2xl transition-all">
              <div className="h-2 bg-gradient-to-r from-grow-teal to-grow-sage" />
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-grow-teal/10 flex items-center justify-center mb-5">
                  <GraduationCap className="h-7 w-7 text-grow-teal" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Apply as a Coach</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Share your professional expertise as a volunteer coach. Mentor entrepreneurs, build
                  global perspective, develop leadership skills.
                </p>
                <ul className="space-y-2 mb-7 text-sm text-muted-foreground">
                  <li>• You have 5+ years professional experience</li>
                  <li>• You can commit 2-3 hours per month</li>
                  <li>• You want to make a measurable global impact</li>
                </ul>
                <Link to="/apply/coach">
                  <Button size="lg" variant="outline" className="w-full border-grow-teal text-grow-teal hover:bg-grow-teal hover:text-white gap-2">
                    Start Coach Application <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
