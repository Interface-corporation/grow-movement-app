import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, TrendingUp, Plus, Check, Briefcase, Loader2, Globe, Mail, Phone, Linkedin, Play, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

export default function EntrepreneurProfile() {
  const { id } = useParams();
  const { addToCart, isInCart, removeFromCart, isFull } = useCart();
  const [ent, setEnt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('entrepreneurs').select('*').eq('id', id).maybeSingle();
      setEnt(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="pt-24 pb-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!ent) return (
    <div className="pt-24 pb-16 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Entrepreneur Not Found</h1>
        <Link to="/entrepreneurs"><Button variant="outline">Back to Directory</Button></Link>
      </div>
    </div>
  );

  const inCart = isInCart(ent.id);
  const handleCartToggle = () => { if (inCart) removeFromCart(ent.id); else addToCart({ id: ent.id, name: ent.name, photo: ent.photo_url, businessName: ent.business_name, country: ent.country, sector: ent.sector, stage: ent.stage, gender: ent.gender, pitchSummary: ent.pitch_summary || '', businessDescription: ent.business_description || '', fundingNeeds: ent.funding_needs || '', coachingNeeds: ent.coaching_needs || '', revenue: ent.revenue || '', yearFounded: ent.year_founded || 0, teamSize: ent.team_size || 0, status: ent.status }); };

  // Extract YouTube embed URL
  const getVideoEmbed = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  };

  const InfoCard = ({ title, content }: { title: string; content: string | null }) => {
    if (!content) return null;
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <Link to="/entrepreneurs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <img src={ent.photo_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'} alt={ent.name} className="w-full aspect-square object-cover" />
                <div className="p-5">
                  <h1 className="text-2xl font-bold text-foreground mb-1">{ent.name}</h1>
                  <p className="text-primary font-medium mb-3">{ent.business_name}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{ent.country}</div>
                    <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{ent.sector}</div>
                    {ent.year_founded && <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />Founded {ent.year_founded}</div>}
                    {ent.team_size && <div className="flex items-center gap-2"><Users className="h-4 w-4" />{ent.team_size} team members</div>}
                    {ent.revenue && <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />{ent.revenue}</div>}
                    {ent.website && <a href={ent.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Globe className="h-4 w-4" />Website</a>}
                    {ent.linkedin && <a href={ent.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Linkedin className="h-4 w-4" />LinkedIn</a>}
                    {ent.pitch_deck_url && <a href={ent.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline"><FileText className="h-4 w-4" />Pitch Deck</a>}
                  </div>
                </div>
              </div>

              <Button onClick={handleCartToggle} disabled={!inCart && isFull}
                className="w-full py-3 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                {inCart ? (<><Check className="mr-2 h-5 w-5" />In Your Selection</>) : isFull ? 'Selection Full (Max 3)' : (<><Plus className="mr-2 h-5 w-5" />Add to Selection</>)}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-3 flex-wrap">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${ent.status === 'Alumni' ? 'bg-accent text-accent-foreground' : 'bg-grow-gold text-grow-navy'}`}>
                {ent.status}
              </span>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{ent.stage}</span>
            </div>

            {/* Video */}
            {ent.video_url && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  <h3 className="font-bold">Profile Video</h3>
                </div>
                <div className="aspect-video">
                  <iframe src={getVideoEmbed(ent.video_url)} className="w-full h-full" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              </div>
            )}

            <InfoCard title="Pitch Summary" content={ent.pitch_summary} />
            <InfoCard title="About the Business" content={ent.business_description} />
            <InfoCard title="About the Entrepreneur" content={ent.about_entrepreneur} />
            <InfoCard title="Products & Services" content={ent.products_services} />
            <InfoCard title="Social & Environmental Impact" content={ent.impact} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Funding Needs</h3>
                <p className="text-muted-foreground">{ent.funding_needs || 'Not specified'}</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Coaching Needs</h3>
                <p className="text-muted-foreground">{ent.coaching_needs || 'Not specified'}</p>
              </div>
            </div>

            <InfoCard title="Market & Distribution" content={ent.market_size} />
            <InfoCard title="Competition & Advantages" content={ent.competition} />
            <InfoCard title="Key Challenges" content={ent.top_challenges} />
            <InfoCard title="Opportunities & Vision" content={ent.opportunities} />
          </div>
        </div>
      </div>
    </div>
  );
}
