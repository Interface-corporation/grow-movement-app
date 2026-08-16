import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, Quote, ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicTestimonials } from '@/hooks/usePublicTestimonials';
import { toEmbedUrl } from '@/lib/videoEmbed';

// Fallback highlights, used only until real published impact case studies exist.
const fallbackTestimonials = [
  { name: 'Daniel K.', role: 'Coach, ex-McKinsey', avatar: 'https://i.pravatar.cc/150?img=12', text: 'Coaching with Grow Movement is incredibly rewarding. The structure they provide makes every session impactful.', hasVideo: false },
  { name: 'Esther N.', role: 'Founder, EcoFarm Kenya', avatar: 'https://i.pravatar.cc/150?img=47', text: 'Within 6 months I had clarity, a roadmap, and my first paying B2B clients. Game-changing program.', hasVideo: false },
  { name: 'Marc D.', role: 'Investor, Africa Ventures', avatar: 'https://i.pravatar.cc/150?img=33', text: 'I source some of my most promising deals from Grow Movement. Their entrepreneurs are investor-ready.', hasVideo: false },
  { name: 'Sara H.', role: 'Founder, Yelo Crafts', avatar: 'https://i.pravatar.cc/150?img=45', text: 'The mentorship transformed my mindset. I now lead a team of 12 and we just opened our second store.', hasVideo: false },
  { name: 'Patrick O.', role: 'Coach, Tech Lead', avatar: 'https://i.pravatar.cc/150?img=14', text: 'A wonderfully run program. The matching system is intelligent and the entrepreneurs are deeply motivated.', hasVideo: false },
  { name: 'Lina M.', role: 'Founder, Sahel Skincare', avatar: 'https://i.pravatar.cc/150?img=49', text: 'I went from selling at local markets to launching online with international shipping. Pure transformation.', hasVideo: false },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', dragFree: true });
  const { testimonials: real } = usePublicTestimonials(12);

  const slides = useMemo(() => {
    const mapped = real
      .filter(t => t.entrepreneur_review || t.coach_review)
      .map(t => ({
        name: t.entrepreneur_name || 'Grow entrepreneur',
        role: [t.business_name, t.country].filter(Boolean).join(', ') || 'Grow Movement entrepreneur',
        avatar: t.entrepreneur_photo_url || '',
        text: (t.entrepreneur_review || t.coach_review) as string,
        hasVideo: !!toEmbedUrl(t.video_url),
      }));
    return mapped.length > 0 ? mapped : fallbackTestimonials;
  }, [real]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    const id = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [emblaApi, slides]);

  const initials = (name: string) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <section className="py-10 md:py-14 bg-background overflow-hidden">
      <div className="container mx-auto px-5 sm:px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
            Loved by{' '}
            <span className="inline-block bg-[length:200%_200%] bg-gradient-to-r from-grow-coral via-orange-400 to-grow-gold bg-clip-text text-transparent animate-gradient">
              our community
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from the entrepreneurs, coaches, and investors who make this movement.
          </p>
        </motion.div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 px-5 sm:px-5 sm:px-6 lg:px-8">
          {[...slides, ...slides].map((t, i) => (
            <div key={i} className="shrink-0 w-[85%] sm:w-[440px]">
              <div className="bg-card border border-border rounded-3xl p-7 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-grow-gold text-grow-gold" />
                    ))}
                  </div>
                  {t.hasVideo && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      <PlayCircle className="h-4 w-4" /> Video
                    </span>
                  )}
                </div>
                <Quote className="h-7 w-7 text-primary/40 mb-3" />
                <p className="text-foreground leading-relaxed mb-6 line-clamp-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-border">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} loading="lazy" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {initials(t.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground text-sm truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-5 sm:px-6 lg:px-8 mt-10 text-center">
        <Link to="/testimonials">
          <Button size="lg" className="rounded-2xl">
            See all real testimonials <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
