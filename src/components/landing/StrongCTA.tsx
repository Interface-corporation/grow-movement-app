import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, GraduationCap, Building2, Heart, ArrowRight } from 'lucide-react';

const ctas = [
  { icon: Rocket, label: 'Apply as Entrepreneur', href: '/apply', color: 'bg-primary' },
  { icon: GraduationCap, label: 'Apply to Volunteer', href: '/apply/coach', color: 'bg-accent' },
  { icon: Building2, label: 'Apply as Partner', href: '#contact', color: 'bg-grow-gold' },
  { icon: Heart, label: 'Donate to the Movement', href: '#contact', color: 'bg-grow-sage' },
];

export function StrongCTA() {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-grow-navy text-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden p-8 md:p-16 lg:p-20 max-w-7xl mx-auto"
        >
          {/* Decorative blobs */}
          <motion.div
            aria-hidden
            className="absolute -top-20 -right-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
            animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
            animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Join the Movement</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black mt-3 mb-5 leading-[1.05]">
              Start your growth journey today
            </h2>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed">
              Join a global community dedicated to building sustainable businesses and creating measurable impact.
            </p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ctas.map((c, i) => {
              const isExternal = c.href.startsWith('#');
              const Wrapper: any = isExternal ? 'a' : Link;
              const wrapperProps = isExternal ? { href: c.href } : { to: c.href };
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Wrapper {...wrapperProps} className="block group">
                    <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 backdrop-blur-md">
                      <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <c.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="font-bold text-base mb-3">{c.label}</div>
                      <div className="flex items-center text-sm text-white/60 group-hover:text-primary transition-colors">
                        Get started <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Wrapper>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
