import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Briefcase, HeartHandshake, Building2 } from 'lucide-react';

const stats = [
  { icon: Users, value: 2000, suffix: '+', label: 'Entrepreneurs Coached', color: 'text-primary' },
  { icon: Briefcase, value: 850, suffix: '+', label: 'Impactful Business Projects', color: 'text-accent' },
  { icon: HeartHandshake, value: 320, suffix: '+', label: 'Volunteer Coaches', color: 'text-grow-gold' },
  { icon: Building2, value: 45, suffix: '+', label: 'Corporate Partners', color: 'text-grow-sage' },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.floor(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="relative -mt-16 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-card rounded-3xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] border border-border p-6 md:p-10"
        >
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Driving Real Impact</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">Across Communities Worldwide</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className={`mx-auto w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-2 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
