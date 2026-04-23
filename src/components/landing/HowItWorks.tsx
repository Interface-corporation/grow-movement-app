import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Users, BookOpen, Trophy, Star, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: FileText, title: 'Apply', desc: 'Sign up as an entrepreneur, volunteer coach, or partner organization.' },
  { icon: CheckCircle2, title: 'Get Accepted', desc: 'Our team reviews your application and welcomes you into the program.' },
  { icon: Users, title: 'Get Matched', desc: 'We pair you with the right coach or entrepreneur based on goals & expertise.' },
  { icon: BookOpen, title: 'Coaching Sessions', desc: 'Work through structured sessions while building your business project.' },
  { icon: Trophy, title: 'Finalize Project', desc: 'Complete your business project with measurable outcomes and reports.' },
  { icon: Star, title: 'Get Featured', desc: 'Your profile is published on our platform — visible to investors and partners.' },
  { icon: Heart, title: 'Follow-up & Reviews', desc: 'Continued mentorship and testimonials to celebrate your growth.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How It Works</span>
          <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
            Your journey, step by step
          </h2>
          <p className="text-lg text-muted-foreground">
            A clear, proven path from application to becoming an investor-ready entrepreneur.
          </p>
        </motion.div>

        {/* Connector path on large screens */}
        <div className="relative max-w-7xl mx-auto">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5">
            <svg className="w-full h-2" preserveAspectRatio="none" viewBox="0 0 100 2">
              <line x1="0" y1="1" x2="100" y2="1" strokeDasharray="2 2" stroke="hsl(var(--border))" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 lg:gap-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-2xl p-5 h-full hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 mx-auto">
                    <s.icon className="h-5 w-5" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-grow-navy text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-center text-sm md:text-base mb-2">{s.title}</h3>
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-14"
        >
          <Link to="/apply">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-base font-semibold group">
              Start Your Application
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
