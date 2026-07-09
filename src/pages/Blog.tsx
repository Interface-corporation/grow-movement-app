import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Calendar, ArrowRight, Newspaper, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      setPosts(data || []);
      setLoading(false);
    })();
  }, []);

  const featured = posts.slice(0, 3);
  const rest = posts.slice(3);

  // Auto-rotate hero
  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setTickerIdx(i => (i + 1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [featured.length]);

  const active = featured[tickerIdx];

  if (loading) {
    return (
      <div className="pt-24 pb-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="pt-16 pb-20 bg-background">
      {/* ── HERO / NEWS FEED ── */}
      <section className="relative bg-grow-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/.3),transparent_60%),radial-gradient(circle_at_80%_60%,hsl(var(--accent)/.25),transparent_60%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative">
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.28em] uppercase text-grow-gold mb-4">
            <Newspaper className="h-4 w-4" /> Grow Newsroom
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-grow-cream   leading-[1.05] max-w-3xl">
            Stories that <span className="text-grow-coral">move the movement.</span> 
          </h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">
            Field dispatches, founder wins, coach reflections and program news — updated as it happens.
          </p>

          {/* Featured rotator */}
          {active && (
            <div className="mt-10 rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <Link to={`/blog/${active.slug}`} className="block relative aspect-video md:aspect-auto md:h-full overflow-hidden group">
                  {active.cover_image_url ? (
                    <img src={active.cover_image_url} alt={active.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-grow-coral/40 to-grow-gold/40" />
                  )}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-grow-coral text-white text-xs font-bold uppercase tracking-wider">
                    <TrendingUp className="h-3 w-3" /> Featured
                  </div>
                </Link>
                <div className="p-6 md:p-10 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                        <Calendar className="h-3.5 w-3.5" /> {fmtDate(active.created_at)}
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                        <Link to={`/blog/${active.slug}`} className="hover:text-grow-gold transition-colors">
                          {active.title}
                        </Link>
                      </h2>
                      <p className="mt-3 text-white/75 line-clamp-3">
                        {active.excerpt || active.content?.substring(0, 220)}
                      </p>
                      <Link to={`/blog/${active.slug}`}
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-grow-gold hover:gap-3 transition-all">
                        Read the story <ArrowRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  </AnimatePresence>

                  {featured.length > 1 && (
                    <div className="mt-8 flex items-center gap-3">
                      <button onClick={() => setTickerIdx(i => (i - 1 + featured.length) % featured.length)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Previous">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="flex gap-1.5">
                        {featured.map((_, i) => (
                          <button key={i} onClick={() => setTickerIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${i === tickerIdx ? 'w-8 bg-grow-coral' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                            aria-label={`Go to slide ${i + 1}`} />
                        ))}
                      </div>
                      <button onClick={() => setTickerIdx(i => (i + 1) % featured.length)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Next">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl mb-2">No stories published yet.</p>
            <p>Check back soon — we're writing.</p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold">Latest stories</h2>
                <p className="text-muted-foreground mt-1">Insights, updates and voices from the community.</p>
              </div>
              <span className="hidden sm:block text-sm text-muted-foreground">{posts.length} article{posts.length === 1 ? '' : 's'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(rest.length ? rest : posts).map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: (i % 6) * 0.05 }}
                >
                  <Link to={`/blog/${post.slug}`}
                    className="group flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {post.cover_image_url ? (
                        <img src={post.cover_image_url} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Newspaper className="h-10 w-10 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3.5 w-3.5" /> {fmtDate(post.created_at)}
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-5 flex-1">
                        {post.excerpt || post.content?.substring(0, 160)}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                        Continue reading <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
