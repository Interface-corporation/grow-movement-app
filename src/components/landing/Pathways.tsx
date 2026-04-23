import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, GraduationCap, Building2, ArrowUpRight } from 'lucide-react';

const pathways = [
  {
    icon: Rocket,
    title: 'Entrepreneurs',
    description: 'Grow your business with expert guidance, structured coaching, and visibility to investors.',
    cta: 'Apply Now',
    href: '/apply',
    accent: 'bg-primary text-primary-foreground',
    border: 'hover:border-primary',
  },
  {
    icon: GraduationCap,
    title: 'Volunteers',
    description: 'Share your expertise and make a real, measurable impact on entrepreneurs across the globe.',
    cta: 'Join as Volunteer',
    href: '/apply/coach',
    accent: 'bg-accent text-accent-foreground',
    border: 'hover:border-accent',
  },
  {
    icon: Building2,
    title: 'Partners',
    description: 'Collaborate with us to fund, scale, and support entrepreneurship ecosystems worldwide.',
    cta: 'Partner With Us',
    href: '#contact',
    accent: 'bg-grow-gold text-white',
    border: 'hover:border-grow-gold',
  },
];

export function Pathways() {
  return (
    <section className="py-24 md:py-32 bg-secondary/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Built for Everyone</span>
          <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
            Your role in the movement
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're starting out, sharing wisdom, or scaling impact — there's a place for you here.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pathways.map((p, i) => {
            const isExternal = p.href.startsWith('#');
            const Wrapper: any = isExternal ? 'a' : Link;
            const wrapperProps = isExternal ? { href: p.href } : { to: p.href };

            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Wrapper {...wrapperProps} className="block group">
                  <div className={`relative h-full bg-card rounded-3xl p-8 border-2 border-border ${p.border} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden`}>
                    <div className={`w-16 h-16 rounded-2xl ${p.accent} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                      <p.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-3">{p.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-8 min-h-[72px]">{p.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {p.cta}
                      </span>
                      <span className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
