import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Handshake, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Empowering Entrepreneurs Worldwide
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.05] mb-6">
            Grow Your Vision.{' '}
            <span className="text-primary">Connect</span> with{' '}
            <span className="text-accent">Opportunity.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            We educate, coach, and connect young entrepreneurs with the right investors
            and mentors to build thriving businesses across the globe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/entrepreneurs">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-base font-semibold w-full sm:w-auto">
                Explore Entrepreneurs <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="px-8 py-3 text-base font-semibold w-full sm:w-auto">
                How It Works
              </Button>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-foreground">250+</div>
              <div className="text-sm text-muted-foreground mt-1">Entrepreneurs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-foreground">50+</div>
              <div className="text-sm text-muted-foreground mt-1">Coaches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-foreground">15</div>
              <div className="text-sm text-muted-foreground mt-1">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { icon: Users, step: '01', title: 'Discover Entrepreneurs', description: 'Browse our curated directory of talented entrepreneurs undergoing training or alumni who have completed our programs.', color: 'bg-primary/10 text-primary' },
    { icon: Handshake, step: '02', title: 'Select & Prioritize', description: 'Add up to 3 entrepreneurs to your selection cart, set your priorities, and tell us why you want to connect.', color: 'bg-accent/10 text-accent' },
    { icon: TrendingUp, step: '03', title: 'Get Matched', description: 'Our team reviews your request and creates the perfect match between you and the entrepreneurs for maximum impact.', color: 'bg-grow-gold/10 text-grow-gold' },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Simple Process</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mt-3 mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Whether you're a coach, mentor, or investor — finding the right entrepreneur is easy.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.step} className="relative bg-background rounded-2xl p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-6`}>
                <step.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Step {step.step}</span>
              <h3 className="text-xl font-bold mt-2 mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutPreview() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">About Grow Movement</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3 mb-6">Building the Next Generation of African Entrepreneurs</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">Grow Movement is a global capacity-building organization dedicated to empowering young entrepreneurs through structured training, expert coaching, and strategic connections with investors and mentors.</p>
            <p className="text-muted-foreground mb-8 leading-relaxed">Our mission is to create more entrepreneurs across the world by providing them with the tools, knowledge, and network they need to succeed.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-2xl font-display font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground mt-1">Business survival rate</div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-2xl font-display font-bold text-accent">3x</div>
                <div className="text-sm text-muted-foreground mt-1">Revenue growth avg.</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-grow-gold/10 rounded-3xl aspect-square flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🌱</div>
                <p className="font-display text-2xl font-bold text-foreground">Grow. Connect. Thrive.</p>
                <p className="text-muted-foreground mt-2">Empowering entrepreneurs since 2018</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlogSection() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      setPosts(data || []);
    };
    fetch();
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Latest News</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mt-3 mb-4">From Our Blog</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-background rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {post.cover_image_url && (
                <img src={post.cover_image_url} alt="" className="w-full h-48 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt || post.content.substring(0, 120)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-grow-navy text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6">Ready to Find Your Next Investment?</h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">Browse our directory of talented entrepreneurs and discover businesses ready for your coaching, mentorship, or investment.</p>
        <Link to="/entrepreneurs">
          <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-10 py-3 text-base font-semibold">
            Explore Entrepreneurs <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
