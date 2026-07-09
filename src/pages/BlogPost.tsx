import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Calendar, Clock, Share2, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      setPost(data);
      if (data) {
        const { data: rel } = await supabase
          .from('blog_posts')
          .select('id,slug,title,cover_image_url,created_at,excerpt')
          .eq('published', true)
          .neq('id', data.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setRelated(rel || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      setProgress(height > 0 ? (scrolled / height) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const readingMins = useMemo(() => {
    if (!post?.content) return 1;
    const words = post.content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 220));
  }, [post]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url }); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied to clipboard' });
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Link to="/blog" className="text-primary hover:underline">Back to Blog</Link>
      </div>
    );
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-background">
      {/* Reading progress */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-transparent z-40">
        <div className="h-full bg-gradient-to-r from-grow-coral to-grow-gold transition-[width] duration-150"
             style={{ width: `${progress}%` }} />
      </div>

      {/* Cinematic hero */}
      <header className="relative pt-24 pb-14 md:pb-20 overflow-hidden">
        {post.cover_image_url && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-sm opacity-30"
              style={{ backgroundImage: `url(${post.cover_image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          </>
        )}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl relative">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            <span>Grow Newsroom</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight text-foreground">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-5">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {fmtDate(post.created_at)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {readingMins} min read</span>
            <button onClick={share} className="ml-auto inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </header>

      {/* Cover image */}
      {post.cover_image_url && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <img
            src={post.cover_image_url}
            alt=""
            className="w-full aspect-[16/9] object-cover rounded-2xl shadow-2xl -mt-4"
          />
        </div>
      )}

      {/* Body */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 md:py-20">
        <div className="prose prose-lg max-w-none text-foreground leading-[1.85]
                        prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                        prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-3
                        prose-p:text-foreground/90 prose-p:text-[1.075rem]
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-foreground
                        prose-blockquote:border-l-4 prose-blockquote:border-grow-coral
                        prose-blockquote:bg-grow-coral/5 prose-blockquote:py-2 prose-blockquote:px-6
                        prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                        prose-img:rounded-xl prose-img:shadow-lg">
          <div className="whitespace-pre-wrap">{post.content}</div>
        </div>

        {/* End rule */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">End</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">Keep reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(r => (
                <Link key={r.id} to={`/blog/${r.slug}`}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {r.cover_image_url && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={r.cover_image_url} alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="text-xs text-muted-foreground mb-2">{fmtDate(r.created_at)}</div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{r.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
