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
              Building impact through  <span className="text-primary">human connection</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            "Grow Movement brings together entrepreneurs, professionals, companies, universities, and partners worldwide to build stronger businesses and unlock economic potential in emerging economies.

Through structured coaching and mentoring programs, we connect experienced professionals with ambitious entrepreneurs, helping businesses grow, create jobs, attract investment, strengthen local economies, and create greater stability for families and communities.

At the same time, we help organisations advance their social impact, employee engagement, leadership development, and corporate responsibility goals through meaningful experiential learning opportunities that build leadership capabilities, cross-cultural skills, and global experience while creating measurable impact."
</p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                   A world where every entrepreneur, regardless of geography, has access to the knowledge, networks, and opportunities needed to build thriving businesses, create jobs, and strengthen communities.
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
                   To connect global expertise with local vision, supporting ambitious entrepreneurs to grow businesses that create jobs and economic opportunity, while enabling organizations to develop talent, strengthen leadership, and deliver meaningful social impact.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Video */}
<motion.div
  initial={{ opacity: 0, x: 30 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.7 }}
  className="relative"
>
  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-black">

    {/* Only show iframe after clicking Play */}
    {playing && (
      <iframe
        src="https://drive.google.com/file/d/1M_xUgB5P2xTYAJ-OikY7o-hSSYCiFhBW/preview?autoplay=1"
        title="Grow Movement Video"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0 z-20"
      />
    )}

    {/* Cover Image */}
    {!playing && (
      <>
        <img
          src="/images/grow-video-cover.jpg"
          alt="Grow Movement"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Nice gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

        {/* Play Button */}
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 flex items-center justify-center z-20 group"
        >
          <div className="relative">

            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />

            {/* Button */}
            <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">

              <Play
                className="w-10 h-10 text-green-600 ml-1"
                fill="currentColor"
              />

            </div>
          </div>
        </button>

        {/* Bottom text */}
        <div className="absolute bottom-8 left-8 right-8 z-20 text-white">

          <p className="uppercase tracking-[3px] text-sm text-white/80">
            Featured Story
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            See how Grow Movement is changing lives.
          </h2>

          <p className="mt-2 text-white/90">
            Watch our impact in just 2 minutes.
          </p>

        </div>
      </>
    )}
  </div>

</motion.div>
        </div>
      </div>
    </section>
  );
}
