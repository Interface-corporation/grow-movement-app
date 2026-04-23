import { motion } from 'framer-motion';
import { Sparkles, Globe, TrendingUp, Network } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Personalized Coaching',
    description: 'Tailored one-on-one sessions designed to solve real business challenges with measurable outcomes.',
    color: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary text-primary-foreground',
  },
  {
    icon: Globe,
    title: 'Global Expert Network',
    description: 'Access seasoned professionals from over 15 countries, ready to share their experience with you.',
    color: 'from-accent/20 to-accent/5',
    iconBg: 'bg-accent text-accent-foreground',
  },
  {
    icon: TrendingUp,
    title: 'Investor Readiness',
    description: 'Become attractive to investors with structured frameworks, clear KPIs, and a proven growth playbook.',
    color: 'from-grow-gold/20 to-grow-gold/5',
    iconBg: 'bg-grow-gold text-white',
  },
  {
    icon: Network,
    title: 'Networking & Marketing',
    description: 'Get featured on our platform and connect with partners, investors, and a vibrant community.',
    color: 'from-grow-sage/20 to-grow-sage/5',
    iconBg: 'bg-grow-sage text-white',
  },
];

export function WhyChooseUs() {
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
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Why Choose Us</span>
          <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
            Everything you need to grow
          </h2>
          <p className="text-lg text-muted-foreground">
            We combine expert coaching, a global network, and a structured platform to give you an unfair advantage.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-card rounded-3xl p-7 border border-border overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{f.description}</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-foreground/5 group-hover:scale-150 transition-transform duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
