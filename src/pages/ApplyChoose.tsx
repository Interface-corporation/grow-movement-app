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
    
     {/* ========================= HERO ========================= */}
<section className="relative min-h-[90vh] flex items-center overflow-hidden">

  {/* Background Image */}
  <motion.div
    initial={{ scale: 1.1 }}
    animate={{ scale: 1 }}
    transition={{
      duration: 12,
      ease: "easeOut",
    }}
    className="absolute inset-0"
  >
    <img
      src="/images/applyHero.png"
      alt="African entrepreneur growing a business"
      className="w-full h-full object-cover"
    />

    {/* Dark cinematic overlay */}
    <div className="absolute inset-0 bg-black/50" />

    {/* Soft gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-grow-navy/80 via-grow-navy/55 to-black/40" />
  </motion.div>

  {/* Floating lights */}
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.15, 0.25, 0.15],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
    }}
    className="absolute -top-24 -right-20 w-96 h-96 rounded-full blur-[140px] bg-grow-coral"
  />

  <motion.div
    animate={{
      scale: [1.2, 1, 1.2],
      opacity: [0.2, 0.3, 0.2],
    }}
    transition={{
      duration: 10,
      repeat: Infinity,
    }}
    className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-[160px] bg-grow-teal"
  />

  {/* Content */}
  <div className="container mx-auto px-6 lg:px-8 relative z-20">

    <div className="max-w-3xl">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 mb-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 text-white"
      >
        <Sparkles className="h-4 w-4 text-grow-gold" />
        <span className="text-sm font-semibold tracking-wide">
          Applications are now open
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="font-display text-5xl md:text-7xl font-black leading-[1.05] text-white"
      >
        Turn your
        <span className="block text-grow-coral">
          business vision
        </span>
        into measurable impact.
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="mt-8 text-lg md:text-2xl text-white/85 leading-relaxed max-w-2xl"
      >
        Join thousands of entrepreneurs across Africa and Asia receiving
        world-class coaching, leadership training, and connections to
        investors through Grow Movement.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-5 mt-10"
      >
        <Link to="/apply/entrepreneur">
          <Button
            size="lg"
            className="h-14 px-8 text-lg bg-grow-coral hover:bg-grow-coral/90 rounded-full shadow-xl"
          >
            Apply as Entrepreneur
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>

        <Link to="/apply/coach">
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg rounded-full border-white text-white bg-white/10 backdrop-blur hover:bg-white hover:text-grow-navy"
          >
            Become a Coach
          </Button>
        </Link>
      </motion.div>

    </div>

  </div>

  {/* Floating statistics */}
  <motion.div
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
    }}
    className="hidden lg:block absolute bottom-12 right-12 z-30"
  >
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl px-8 py-6 shadow-2xl">

      <div className="text-5xl font-black text-grow-gold">
        4,000+
      </div>

      <div className="text-white/90 mt-2 font-medium">
        Entrepreneurs supported
      </div>

      <div className="w-full h-px bg-white/20 my-4" />

      <div className="flex items-center gap-3">

        

        <div>
          <div className="text-white font-semibold">
            Across Africa & Asia
          </div>

          <div className="text-sm text-white/70">
            Building sustainable businesses
          </div>
        </div>

      </div>

    </div>
  </motion.div>

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
