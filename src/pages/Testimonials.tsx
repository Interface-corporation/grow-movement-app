import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Quote, PlayCircle, Search, Sparkles, ArrowRight, Star, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePublicTestimonials, type PublicTestimonial } from '@/hooks/usePublicTestimonials';
import { toEmbedUrl, isDirectVideoFile } from '@/lib/videoEmbed';
import { countryFlag } from '@/lib/countryFlag';
import heroImage from '@/assets/testimonials-hero.jpg';

function initials(name?: string | null) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function Stars({ rating, className = 'h-3.5 w-3.5' }: { rating: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`${className} ${n <= rating ? 'fill-grow-gold text-grow-gold' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

/** Responsive 16:9 player that keeps Google Drive / YouTube embeds fitted on every screen. */
function VideoFrame({ embed, title }: { embed: string; title: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video">
      {isDirectVideoFile(embed) ? (
        <video src={embed} controls playsInline className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <iframe
          src={embed}
          title={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

function TestimonialCard({ t, index, onOpen }: { t: PublicTestimonial; index: number; onOpen: () => void }) {
  const embed = toEmbedUrl(t.video_url);
  const review = t.entrepreneur_review || '';
  const rating = t.rating ?? 5;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group h-full bg-card border border-border rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Media — fixed 16:9 on every device */}
      <button onClick={onOpen} className="relative block w-full aspect-video bg-secondary overflow-hidden text-left"
        aria-label={embed ? 'Play impact video' : 'Read full story'}>
        {t.entrepreneur_photo_url ? (
          <img src={t.entrepreneur_photo_url} alt={`${t.entrepreneur_name || 'Entrepreneur'} — Grow Movement testimonial`}
            loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-accent/10 to-grow-gold/15">
            <span className="font-display text-4xl font-black text-primary/70">{initials(t.entrepreneur_name)}</span>
          </div>
        )}
        {embed && (
          <span className="absolute inset-0 flex items-center justify-center bg-foreground/25 group-hover:bg-foreground/40 transition-colors">
            <span className="flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 text-xs sm:text-sm font-bold text-foreground shadow-lg">
              <PlayCircle className="h-5 w-5 text-primary" /> Watch impact video
            </span>
          </span>
        )}
      </button>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Stars rating={rating} />
          {embed && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              <Film className="h-3 w-3" /> Video
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-bold leading-snug line-clamp-2 min-h-[3.5rem]">
          {t.title || `${t.entrepreneur_name || 'A Grow entrepreneur'}'s story`}
        </h3>

        <div className="min-h-[6.5rem]">
          <Quote className="h-5 w-5 text-primary/40 mb-2" />
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line line-clamp-4">
            {review || 'Watch the impact video to hear this story.'}
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/40 border border-border p-4 min-h-[5.5rem]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Coach's feedback{t.coach_name ? ` — ${t.coach_name}` : ''}
          </p>
          <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-2">
            {t.coach_review || 'Coach feedback coming soon.'}
          </p>
        </div>

        <Button variant="outline" size="sm" className="rounded-xl w-full" onClick={onOpen}>
          Read more <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>

        <div className="mt-auto pt-4 border-t border-border flex items-center gap-3">
          {t.entrepreneur_photo_url ? (
            <img src={t.entrepreneur_photo_url} alt="" loading="lazy" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {initials(t.entrepreneur_name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{t.entrepreneur_name || 'Grow entrepreneur'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {[t.business_name, t.country ? `${countryFlag(t.country)} ${t.country}` : null].filter(Boolean).join(' · ')}
            </p>
          </div>
          {t.entrepreneur_id && (
            <Link to={`/entrepreneurs/${t.entrepreneur_id}`}
              className="ml-auto text-xs font-bold text-primary hover:underline shrink-0">Profile</Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function TestimonialDialog({ t, onClose }: { t: PublicTestimonial | null; onClose: () => void }) {
  const embed = t ? toEmbedUrl(t.video_url) : null;
  return (
    <Dialog open={!!t} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
        {t && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl md:text-2xl font-black pr-6 text-left">
                {t.title || `${t.entrepreneur_name || 'A Grow entrepreneur'}'s story`}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-3">
              <Stars rating={t.rating ?? 5} className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">
                {[t.entrepreneur_name, t.business_name, t.country ? `${countryFlag(t.country)} ${t.country}` : null]
                  .filter(Boolean).join(' · ')}
              </p>
            </div>

            {embed && <VideoFrame embed={embed} title={t.title || 'Impact video'} />}
            {t.video_url && !embed && (
              <a href={t.video_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                <PlayCircle className="h-4 w-4" /> Open video link
              </a>
            )}

            {t.entrepreneur_review && (
              <section>
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-2">
                  Entrepreneur's review
                </h4>
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{t.entrepreneur_review}</p>
              </section>
            )}

            {t.coach_review && (
              <section className="rounded-2xl bg-secondary/40 border border-border p-4">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-accent mb-2">
                  Coach's feedback{t.coach_name ? ` — ${t.coach_name}` : ''}
                </h4>
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{t.coach_review}</p>
              </section>
            )}

            {t.entrepreneur_id && (
              <Link to={`/entrepreneurs/${t.entrepreneur_id}`} onClick={onClose}>
                <Button variant="outline" className="rounded-2xl w-full">
                  View full profile <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function TestimonialsPage() {
  const { testimonials, loading } = usePublicTestimonials();
  const [query, setQuery] = useState('');
  const [onlyVideo, setOnlyVideo] = useState(false);
  const [active, setActive] = useState<PublicTestimonial | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return testimonials.filter(t => {
      if (onlyVideo && !toEmbedUrl(t.video_url)) return false;
      if (!q) return true;
      return [t.entrepreneur_name, t.business_name, t.country, t.sector, t.title, t.entrepreneur_review, t.coach_name]
        .filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [testimonials, query, onlyVideo]);

  const videoCount = testimonials.filter(t => toEmbedUrl(t.video_url)).length;

  return (
    <>
      {/* Cinematic hero */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden">
        <motion.img
          src={heroImage}
          alt="Grow Movement entrepreneur smiling in her shop at golden hour"
          width={1920} height={1088}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 14, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-primary/25 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-grow-gold/20 blur-3xl animate-pulse" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/70 backdrop-blur px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" /> Real Impact, Real Voices
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black mt-6 mb-5 leading-[1.05]">
              Stories that prove{' '}
              <span className="bg-[length:200%_200%] bg-gradient-to-r from-grow-coral via-orange-400 to-grow-gold bg-clip-text text-transparent animate-gradient">
                coaching changes lives
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Every story below comes from a completed coaching journey — told by the entrepreneur,
              and confirmed by the coach who walked beside them.
            </p>
            <div className="flex flex-wrap items-center gap-8 mt-9">
              <div><span className="font-display text-3xl font-black text-primary">{testimonials.length}</span>
                <span className="text-muted-foreground ml-2 text-sm">stories</span></div>
              <div><span className="font-display text-3xl font-black text-accent">{videoCount}</span>
                <span className="text-muted-foreground ml-2 text-sm">video testimonials</span></div>
              <div className="flex items-center gap-2"><Stars rating={5} className="h-4 w-4" />
                <span className="text-muted-foreground text-sm">rated by entrepreneurs</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <label htmlFor="testimonial-search" className="sr-only">Search testimonials</label>
              <input id="testimonial-search" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, business, country or sector"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card text-sm" />
            </div>
            <Button variant={onlyVideo ? 'default' : 'outline'} className="rounded-2xl"
              onClick={() => setOnlyVideo(v => !v)}>
              <PlayCircle className="h-4 w-4 mr-2" /> Video only
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {testimonials.length === 0
                  ? 'Testimonials are being collected right now — check back very soon.'
                  : 'No testimonial matches your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filtered.map((t, i) => (
                <TestimonialCard key={t.id} t={t} index={i} onOpen={() => setActive(t)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <TestimonialDialog t={active} onClose={() => setActive(null)} />

      {/* CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-black mb-4">Want your story here next?</h2>
          <p className="text-muted-foreground mb-8">
            Join Grow Movement as an entrepreneur or volunteer as a coach and help write the next chapter of impact.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/apply"><Button size="lg" className="rounded-2xl">Apply now <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
            <Link to="/donate"><Button size="lg" variant="outline" className="rounded-2xl">Support the movement</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
