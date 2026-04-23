import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import story1 from '@/assets/story-1.jpg';
import story2 from '@/assets/story-2.jpg';
import story3 from '@/assets/story-3.jpg';

const stories = [
  {
    image: story1,
    name: 'Aline Mukamana',
    business: 'Founder, Imena Textiles',
    country: 'Rwanda',
    quote: 'Through Grow Movement, I increased my revenue 3x and now export traditional fabrics across East Africa. The coaching changed how I think about scale.',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    image: story2,
    name: 'Samuel Okonkwo',
    business: 'Founder, AgriTech Naija',
    country: 'Nigeria',
    quote: 'My coach helped me design a tech platform that connects 1,200 farmers to fair markets. We just closed our first investment round.',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    image: story3,
    name: 'Priya Sharma',
    business: 'Founder, Spice Studio',
    country: 'India',
    quote: 'The structured sessions gave me the framework to package and sell internationally. My products are now in 4 countries.',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

export function SuccessStories() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const next = () => { setPlaying(false); setIndex((i) => (i + 1) % stories.length); };
  const prev = () => { setPlaying(false); setIndex((i) => (i - 1 + stories.length) % stories.length); };
  const story = stories[index];

  return (
    <section id="stories" className="py-24 md:py-32 bg-grow-navy text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Success Stories</span>
          <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
            Real stories, real growth
          </h2>
          <p className="text-lg text-white/70">
            Meet the entrepreneurs who turned vision into thriving businesses.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch"
            >
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] lg:aspect-auto group">
                <img src={story.image} alt={story.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-grow-navy via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-primary">{story.country}</div>
                  <div className="font-display text-xl font-bold mt-1">{story.name}</div>
                  <div className="text-sm text-white/70">{story.business}</div>
                </div>
              </div>

              {/* Quote */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 lg:p-10 flex flex-col justify-center">
                <Quote className="h-10 w-10 text-primary mb-6" />
                <p className="font-display text-xl md:text-2xl leading-relaxed text-white/90 mb-8">
                  "{story.quote}"
                </p>
                <div className="text-sm text-white/60">— {story.name}, {story.business}</div>
              </div>

              {/* Video */}
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] lg:aspect-auto bg-black">
                {playing ? (
                  <iframe
                    src={`${story.video}?autoplay=1`}
                    title={`${story.name} story`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img src={story.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40" />
                    <button
                      onClick={() => setPlaying(true)}
                      aria-label="Play story video"
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      <span className="relative">
                        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                        <span className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="h-7 w-7 text-primary ml-1" fill="currentColor" />
                        </span>
                      </span>
                    </button>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/70">Watch the story</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-10">
            <div className="flex gap-2">
              {stories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPlaying(false); setIndex(i); }}
                  className="h-1.5 rounded-full bg-white/20 transition-all"
                  style={{ width: i === index ? 40 : 16, background: i === index ? 'hsl(var(--primary))' : undefined }}
                  aria-label={`Story ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={prev} aria-label="Previous" className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-105">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={next} aria-label="Next" className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-105">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
