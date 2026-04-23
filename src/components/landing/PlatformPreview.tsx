import { motion } from 'framer-motion';
import { LayoutDashboard, GitBranch, FileBarChart, CalendarCheck } from 'lucide-react';

const features = [
  { icon: LayoutDashboard, title: 'Session Tracking Dashboard', desc: 'Monitor every coaching session, milestone, and outcome in one place.' },
  { icon: GitBranch, title: 'Smart Matching System', desc: 'Algorithm-assisted pairing that finds the best coach for every entrepreneur.' },
  { icon: FileBarChart, title: 'Progress Notes & Reports', desc: 'Capture insights after every session and generate beautiful progress reports.' },
  { icon: CalendarCheck, title: 'Session Scheduling', desc: 'Built-in calendar integration so you never miss a coaching moment.' },
];

export function PlatformPreview() {
  return (
    <section className="py-24 md:py-32 bg-grow-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center max-w-7xl mx-auto">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Platform</span>
            <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-5 leading-tight">
              A platform designed for <span className="text-primary">real impact</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Built from the ground up to support coaching, sessions, and measurable growth at scale.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">{f.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              {/* mock window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-3 text-xs text-muted-foreground">growmovement.org/dashboard</div>
              </div>
              {/* mock content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-lg font-bold">Coaching Dashboard</div>
                    <div className="text-xs text-muted-foreground">Welcome back, coach</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">DK</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { v: '12', l: 'Active' },
                    { v: '8', l: 'Sessions' },
                    { v: '94%', l: 'Progress' },
                  ].map((s) => (
                    <div key={s.l} className="bg-secondary/60 rounded-xl p-3">
                      <div className="text-xl font-display font-bold text-foreground">{s.v}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {['Aline M. — Strategy Session', 'Samuel O. — Pitch Review', 'Priya S. — Marketing Plan'].map((label, i) => (
                    <div key={label} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
                      <div className={`w-8 h-8 rounded-lg ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent' : 'bg-grow-gold'} text-white flex items-center justify-center text-xs font-bold`}>
                        {label[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold">{label}</div>
                        <div className="text-[10px] text-muted-foreground">Today, 2:00 PM</div>
                      </div>
                      <div className="text-[10px] text-primary font-semibold">Join</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating accent card */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-4 md:-right-8 bg-card rounded-2xl border border-border shadow-xl p-4 hidden md:block"
            >
              <div className="text-xs text-muted-foreground mb-1">This month</div>
              <div className="font-display text-2xl font-black text-primary">+38%</div>
              <div className="text-xs text-muted-foreground">avg. business growth</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
