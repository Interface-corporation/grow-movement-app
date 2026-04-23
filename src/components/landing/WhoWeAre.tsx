import { motion } from 'framer-motion';
import { Play, Target, Eye } from 'lucide-react';
import { useState } from 'react';

export function WhoWeAre() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="about" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Who We Are</span>
            <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-6 leading-[1.1]">
              Building the next generation of <span className="text-primary">global entrepreneurs</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Grow Movement is a global capacity-building organization dedicated to empowering young entrepreneurs through structured training, expert coaching, and strategic connections with investors and mentors.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A world where every entrepreneur, regardless of geography, has access to the knowledge and network they need to build thriving businesses.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bridge the gap between entrepreneurs and global expertise through a scalable, impactful coaching and matching platform.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-grow-navy shadow-2xl">
              {playing ? (
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Grow Movement intro"
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-grow-navy/60 to-accent/40" />
                  <button
                    onClick={() => setPlaying(true)}
                    aria-label="Play intro video"
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <span className="relative">
                      <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                      <span className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-primary ml-1" fill="currentColor" />
                      </span>
                    </span>
                  </button>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70">Watch our story</p>
                    <p className="font-display text-xl md:text-2xl font-bold mt-1">2 minutes that explain everything</p>
                  </div>
                </>
              )}
            </div>

            {/* Floating accent card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl border border-border p-4 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-grow-gold/20 flex items-center justify-center">
                  <span className="text-xl">🌍</span>
                </div>
                <div>
                  <div className="text-2xl font-display font-black text-foreground">15+</div>
                  <div className="text-xs text-muted-foreground">Countries reached</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
