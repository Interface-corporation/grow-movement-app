import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Quote, PlayCircle, Search, Sparkles, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicTestimonials, type PublicTestimonial } from '@/hooks/usePublicTestimonials';
import { toEmbedUrl, isDirectVideoFile } from '@/lib/videoEmbed';
import { countryFlag } from '@/lib/countryFlag';

function initials(name?: string | null) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function TestimonialCard({ t, index }: { t: PublicTestimonial; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const embed = toEmbedUrl(t.video_url);
  const review = t.entrepreneur_review || '';
  const long = review.length > 240;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group bg-card border border-border rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Media */}
      <div className="relative aspect-video bg-secondary overflow-hidden">
        {embed && playing ? (
          isDirectVideoFile(embed)
            ? <video src={embed} controls autoPlay className="w-full h-full object-cover" />
            : <iframe src={embed} title={t.title || 'Testimonial'} className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <>
            {t.entrepreneur_photo_url ? (
              <img src={t.entrepreneur_photo_url} alt={`${t.entrepreneur_name || 'Entrepreneur'} — Grow Movement testimonial`}
                loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 via-accent/10 to-grow-gold/15">
                <span className="font-display text-4xl font-black text-primary/70">{initials(t.entrepreneur_name)}</span>
              </div>
            )}
            {embed && (
              <button onClick={() => setPlaying(true)} aria-label="Play impact video"
                className="absolute inset-0 flex items-center justify-center bg-foreground/25 hover:bg-foreground/40 transition-colors">
                <span className="flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 text-sm font-bold text-foreground shadow-lg">
                  <PlayCircle className="h-5 w-5 text-primary" /> Watch impact video
                </span>
              </button>
            )}
          </>
        )}
      </div>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, k) => (
            <Star key={k} className="h-3.5 w-3.5 fill-grow-gold text-grow-gold" />
          ))}
        </div>

        {t.title && <h3 className="font-display text-lg font-bold leading-snug">{t.title}</h3>}

        {review && (
          <div>
            <Quote className="h-5 w-5 text-primary/40 mb-2" />
            <p className={`text-sm text-foreground/90 leading-relaxed whitespace-pre-line ${!expanded && long ? 'line-clamp-5' : ''}`}>
              {review}
            </p>
            {long && (
              <button onClick={() => setExpanded(e => !e)} className="mt-2 text-xs font-bold text-primary hover:underline">
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {t.coach_review && (
          <div className="rounded-2xl bg-secondary/40 border border-border p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Coach's feedback{t.coach_name ? ` — ${t.coach_name}` : ''}
            </p>
            <p className={`text-sm text-muted-foreground whitespace-pre-line ${expanded ? '' : 'line-clamp-4'}`}>
              {t.coach_review}
            </p>
          </div>
        )}

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

export default function TestimonialsPage() {
  const { testimonials, loading } = usePublicTestimonials();
  const [query, setQuery] = useState('');
  const [onlyVideo, setOnlyVideo] = useState(false);

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
      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-grow-gold/20 blur-3xl animate-pulse" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" /> Real Impact, Real Voices
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-black mt-4 mb-5 leading-tight">
              Testimonials from our{' '}
              <span className="bg-[length:200%_200%] bg-gradient-to-r from-grow-coral via-orange-400 to-grow-gold bg-clip-text text-transparent animate-gradient">
                entrepreneurs
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Every story below comes from a completed coaching journey — told by the entrepreneur,
              and confirmed by the coach who walked beside them.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm">
              <div><span className="font-display text-2xl font-black text-primary">{testimonials.length}</span>
                <span className="text-muted-foreground ml-2">stories</span></div>
              <div><span className="font-display text-2xl font-black text-accent">{videoCount}</span>
                <span className="text-muted-foreground ml-2">video testimonials</span></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t, i) => <TestimonialCard key={t.id} t={t} index={i} />)}
            </div>
          )}
        </div>
      </section>

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
