import { useEffect } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: 'Daniel K.', role: 'Coach, ex-McKinsey', avatar: 'https://i.pravatar.cc/150?img=12', stars: 5, text: 'Coaching with Grow Movement is incredibly rewarding. The structure they provide makes every session impactful.' },
  { name: 'Esther N.', role: 'Founder, EcoFarm Kenya', avatar: 'https://i.pravatar.cc/150?img=47', stars: 5, text: 'Within 6 months I had clarity, a roadmap, and my first paying B2B clients. Game-changing program.' },
  { name: 'Marc D.', role: 'Investor, Africa Ventures', avatar: 'https://i.pravatar.cc/150?img=33', stars: 5, text: 'I source some of my most promising deals from Grow Movement. Their entrepreneurs are investor-ready.' },
  { name: 'Sara H.', role: 'Founder, Yelo Crafts', avatar: 'https://i.pravatar.cc/150?img=45', stars: 5, text: 'The mentorship transformed my mindset. I now lead a team of 12 and we just opened our second store.' },
  { name: 'Patrick O.', role: 'Coach, Tech Lead', avatar: 'https://i.pravatar.cc/150?img=14', stars: 5, text: 'A wonderfully run program. The matching system is intelligent and the entrepreneurs are deeply motivated.' },
  { name: 'Lina M.', role: 'Founder, Sahel Skincare', avatar: 'https://i.pravatar.cc/150?img=49', stars: 5, text: 'I went from selling at local markets to launching online with international shipping. Pure transformation.' },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', dragFree: true });

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <section className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
            Loved by our community
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from the entrepreneurs, coaches, and investors who make this movement.
          </p>
        </motion.div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 px-4 sm:px-6 lg:px-8">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="shrink-0 w-[85%] sm:w-[440px]">
              <div className="bg-card border border-border rounded-3xl p-7 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-grow-gold text-grow-gold" />
                  ))}
                </div>
                <Quote className="h-7 w-7 text-primary/40 mb-3" />
                <p className="text-foreground leading-relaxed mb-6 line-clamp-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-border">
                  <img src={t.avatar} alt={t.name} loading="lazy" className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
