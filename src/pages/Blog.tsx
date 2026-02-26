import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar, ArrowRight } from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="pt-24 pb-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Our Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories, insights, and updates from the Grow Movement community.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl mb-2">No blog posts published yet.</p>
            <p>Check back soon for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                {post.cover_image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.cover_image_url} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt || post.content.substring(0, 150)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
