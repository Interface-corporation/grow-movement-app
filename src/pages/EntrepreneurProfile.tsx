import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, Plus, Check, Briefcase, Loader2, Globe, FileText, Play, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { getProfilePhoto, getVideoEmbedUrl } from '@/lib/avatars';

export default function EntrepreneurProfile() {
  const { id } = useParams();
  const { addToCart, isInCart, removeFromCart, isFull } = useCart();
  const [ent, setEnt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnt = async () => {
      const { data } = await supabase.from('entrepreneurs').select('*').eq('id', id).maybeSingle();
      setEnt(data);
      setLoading(false);
    };
    fetchEnt();
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
  const handleCartToggle = () => {
    if (inCart) removeFromCart(ent.id);
    else addToCart({
      id: ent.id, name: ent.name, photo: ent.photo_url,
      businessName: ent.business_name, country: ent.country, sector: ent.sector,
      stage: ent.stage, gender: ent.gender,
      pitchSummary: ent.pitch_summary || ent.problem_solving || '',
      businessDescription: ent.business_description || ent.products_services || '',
      fundingNeeds: ent.funding_needs || '', coachingNeeds: ent.coaching_needs || '',
      revenue: ent.revenue || '', yearFounded: ent.year_founded || 0,
      teamSize: ent.team_size || 0, status: ent.status,
    });
  };

  // Video embed now handled by shared utility

  const socialLinks = (() => {
    try { return JSON.parse(ent.social_media_links || '[]'); } catch { return []; }
  })();

  const InfoCard = ({ title, content }: { title: string; content: string | null }) => {
    if (!content) return null;
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    );
  };

  const embedUrl = getVideoEmbedUrl(ent.video_url);

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
                <img src={ent.photo_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'}
                  alt={ent.name} className="w-full aspect-square object-cover" />
                <div className="p-5">
                  <h1 className="text-2xl font-bold text-foreground mb-1">{ent.name}</h1>
                  <p className="text-primary font-medium mb-1">{ent.business_name}</p>
                  {ent.role_in_business && <p className="text-sm text-muted-foreground mb-3">{ent.role_in_business}</p>}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{ent.country}{ent.town_city ? `, ${ent.town_city}` : ''}</div>
                    <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{ent.sector}</div>
                    {ent.year_founded && <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />Founded {ent.year_founded}</div>}
                    {ent.team_size && <div className="flex items-center gap-2"><Users className="h-4 w-4" />{ent.team_size} employees</div>}
                  </div>

                  {/* Links */}
                  <div className="mt-4 space-y-2">
                    {ent.website && (
                      <a href={ent.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Globe className="h-4 w-4" /> Website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {ent.pitch_deck_url && (
                      <a href={ent.pitch_deck_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <FileText className="h-4 w-4" /> Pitch Deck <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* Social Media Links */}
                  {socialLinks.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Social Media</p>
                      <div className="flex flex-wrap gap-2">
                        {socialLinks.map((s: any, i: number) => (
                          s.url && (
                            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                              {s.platform || 'Link'}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
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
            {embedUrl && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  <h3 className="font-bold">Profile Video</h3>
                </div>
                <div className="aspect-video">
                  <iframe src={embedUrl} className="w-full h-full" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              </div>
            )}

            <InfoCard title="What does the business do?" content={ent.products_services || ent.business_description} />
            <InfoCard title="Problem Being Solved" content={ent.problem_solving || ent.pitch_summary} />
            <InfoCard title="About the Entrepreneur" content={ent.about_entrepreneur} />
            <InfoCard title="Community & Environmental Impact" content={ent.impact} />
            <InfoCard title="Achievements (Last 12 Months)" content={ent.achievements_12_months} />
            <InfoCard title="Technology & AI" content={ent.technology_ai_used} />

            <InfoCard title="Market & Customers" content={ent.main_customers || ent.market_size} />
            <InfoCard title="Competition & Advantages" content={
              [ent.competition, ent.competitive_advantages].filter(Boolean).join('\n\nCompetitive Advantages:\n') || null
            } />
            <InfoCard title="Business Vision (3-5 Years)" content={ent.business_vision || ent.opportunities} />
          </div>
        </div>
      </div>
    </div>
  );
}
