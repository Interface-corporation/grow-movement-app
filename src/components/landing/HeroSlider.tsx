import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import slide1 from '@/assets/hero-slide-1.jpg';
import slide2 from '@/assets/hero-slide-2.jpg';
import slide3 from '@/assets/hero-slide-3.jpg';

const slides = [
  {
    image: slide1,
    eyebrow: 'For Entrepreneurs',
    title: 'Build, Grow, and Scale Your Business',
    subtitle: 'Connect with experienced global professionals and transform your business through structured, results-driven coaching.',
    primaryCta: { label: 'Apply as Entrepreneur', href: '/apply' },
    secondaryCta: { label: 'Explore Entrepreneurs', href: '/entrepreneurs' },
  },
  {
    image: slide2,
    eyebrow: 'A Global Movement',
    title: 'Where Vision Meets Opportunity',
    subtitle: 'Join a thriving community of entrepreneurs, coaches, and partners building impact across continents.',
    primaryCta: { label: 'Become a Volunteer Coach', href: '/apply/coach' },
    secondaryCta: { label: 'See How It Works', href: '#how-it-works' },
  },
  {
    image: slide3,
    eyebrow: 'Personalized Coaching',
    title: 'Expert Guidance, Real Results',
    subtitle: 'One-on-one mentorship with seasoned professionals who help you solve real business challenges.',
    primaryCta: { label: 'Partner With Us', href: '#partners' },
    secondaryCta: { label: 'Read Success Stories', href: '#stories' },
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next]);

  const slide = slides[index];

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-grow-navy">
      {/* Background image with floating zoom */}
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1.15 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 7, ease: 'linear' } }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="h-full w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-grow-navy/90 via-grow-navy/70 to-grow-navy/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-grow-navy/80 via-transparent to-grow-navy/40" />
        </motion.div>
      </AnimatePresence>

      {/* Soft floating accent shapes */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -left-20 w-[32rem] h-[32rem] rounded-full bg-accent/20 blur-3xl"
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center pt-20">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-sm font-medium text-white mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {slide.eyebrow}
              </span>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] text-white mb-6">
                {slide.title}
              </h1>

              <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed mb-10">
                {slide.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {slide.primaryCta.href.startsWith('#') ? (
                  <a href={slide.primaryCta.href}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold w-full sm:w-auto group">
                      {slide.primaryCta.label}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                ) : (
                  <Link to={slide.primaryCta.href}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold w-full sm:w-auto group">
                      {slide.primaryCta.label}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
                {slide.secondaryCta.href.startsWith('#') ? (
                  <a href={slide.secondaryCta.href}>
                    <Button size="lg" variant="outline" className="bg-white/5 hover:bg-white/15 border-white/30 text-white px-8 py-6 text-base font-semibold backdrop-blur-md w-full sm:w-auto">
                      {slide.secondaryCta.label}
                    </Button>
                  </a>
                ) : (
                  <Link to={slide.secondaryCta.href}>
                    <Button size="lg" variant="outline" className="bg-white/5 hover:bg-white/15 border-white/30 text-white px-8 py-6 text-base font-semibold backdrop-blur-md w-full sm:w-auto">
                      {slide.secondaryCta.label}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Indicators */}
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all"
                style={{ width: i === index ? 56 : 24 }}
              >
                {i === index && (
                  <motion.span
                    key={`bar-${index}`}
                    className="absolute inset-0 bg-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 7, ease: 'linear' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
