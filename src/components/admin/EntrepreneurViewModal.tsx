import { X, MapPin, Briefcase, Calendar, Users, Globe, Mail, Phone, Linkedin, FileText, Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  entrepreneur: any;
  programName: string;
  onClose: () => void;
}

export default function EntrepreneurViewModal({ entrepreneur: ent, programName, onClose }: Props) {
  const getVideoEmbed = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-2">{title}</h4>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: any }) => {
    if (!value) return null;
    return (
      <div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <p className="text-sm text-foreground whitespace-pre-line">{value}</p>
      </div>
    );
  };

  const socialLinks = (() => {
    try { return JSON.parse(ent.social_media_links || '[]'); } catch { return []; }
  })();

  const embedUrl = ent.video_url ? getVideoEmbed(ent.video_url) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 border-b border-border p-6 flex items-start gap-4">
          <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <img src={ent.photo_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'}
              alt={ent.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">{ent.name}</h2>
            <p className="text-primary font-medium">{ent.business_name}</p>
            <div className="flex gap-2 flex-wrap mt-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                ent.status === 'Alumni' ? 'bg-accent/10 text-accent' :
                ent.status === 'Admitted' ? 'bg-grow-gold/10 text-grow-gold' :
                ent.status === 'Matched' ? 'bg-primary/10 text-primary' :
                ent.status === 'Pending' ? 'bg-muted text-muted-foreground' :
                'bg-destructive/10 text-destructive'
              }`}>{ent.status}</span>
              {programName && programName !== '—' && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">{programName}</span>
              )}
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">{ent.stage}</span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{ent.sector}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* General Info */}
          <Section title="General Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Gender" value={ent.gender} />
              <Field label="Country" value={ent.country} />
              <Field label="Town / City" value={ent.town_city} />
              <Field label="Mobile Number" value={ent.mobile_number || ent.phone} />
              <Field label="WhatsApp Number" value={ent.whatsapp_number} />
              <Field label="Email" value={ent.email} />
              <Field label="Role in Business" value={ent.role_in_business} />
              <Field label="Languages Spoken" value={ent.languages_spoken} />
              <Field label="Highest Qualification" value={ent.highest_qualification || ent.education_background} />
            </div>
            <Field label="About the Entrepreneur" value={ent.about_entrepreneur} />
          </Section>

          {/* Video */}
          {embedUrl && (
            <div className="rounded-xl overflow-hidden border border-border aspect-video">
              <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
            </div>
          )}

          {/* Business Overview */}
          <Section title="Business Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Business Name" value={ent.business_name} />
              <Field label="Stage of Business" value={ent.stage} />
              <Field label="Business Sector" value={ent.sector} />
              <Field label="Total Employees" value={ent.team_size} />
              <Field label="Work Type" value={ent.work_type} />
              <Field label="Year Founded" value={ent.year_founded} />
            </div>
            <Field label="What does your business do?" value={ent.products_services || ent.business_description} />
            <Field label="How are you making money?" value={ent.how_making_money} />
            <Field label="What problem are you solving?" value={ent.problem_solving || ent.pitch_summary} />
            <Field label="Community / Environmental Impact" value={ent.impact} />
            <Field label="Achievements (last 12 months)" value={ent.achievements_12_months} />
            <Field label="Technology / AI Used" value={ent.technology_ai_used} />
            <Field label="Tech Challenges / Opportunities" value={ent.tech_challenges} />
          </Section>

          {/* Pitch Deck */}
          {ent.pitch_deck_url && (
            <a href={ent.pitch_deck_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
              <FileText className="h-4 w-4" /> View Pitch Deck <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {/* Market & Competition */}
          <Section title="Market & Competition">
            <Field label="Main Customers" value={ent.main_customers || ent.market_size} />
            <Field label="International Customers" value={ent.international_customers} />
            <Field label="International Customer Details" value={ent.international_customer_details} />
            <Field label="Marketing Methods" value={ent.marketing_methods} />
            <Field label="Website" value={ent.website} />
            {socialLinks.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Social Media</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {socialLinks.map((s: any, i: number) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                      {s.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <Field label="Main Competitors" value={ent.competition} />
            <Field label="Competitive Advantages" value={ent.competitive_advantages} />
            <Field label="Market Trends" value={ent.market_trends} />
          </Section>

          {/* Financials */}
          <Section title="Basic Financials">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Total Investment" value={ent.total_investment || ent.financials} />
              <Field label="Financial Records Method" value={ent.financial_recording_method} />
              <Field label="Est. Revenue (24 months)" value={ent.estimated_revenue_24m || ent.revenue} />
              <Field label="Est. Expenses (24 months)" value={ent.estimated_expenses_24m} />
              <Field label="Highest Costs" value={ent.highest_costs} />
            </div>
          </Section>

          {/* Coaching & Mentoring */}
          <Section title="Coaching & Mentoring">
            <Field label="Business Vision (3-5 years)" value={ent.business_vision || ent.opportunities} />
            <Field label="Other Businesses" value={ent.other_businesses} />
            <Field label="Other Businesses Details" value={ent.other_businesses_details} />
            <Field label="Top 3 Challenges" value={ent.top_challenges} />
            <Field label="Top 3 Opportunities" value={ent.top_3_opportunities} />
            <Field label="Areas Needing Help" value={ent.coaching_needs} />
            <Field label="Help Areas Details" value={ent.areas_help_details} />
            <Field label="Top 3 Skills to Develop" value={ent.top_3_skills} />
            <Field label="Desired Coach Background" value={ent.desired_coach_background} />
          </Section>

          {/* Next of Kin */}
          <Section title="Next of Kin">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={ent.next_of_kin_name || ent.next_of_kin} />
              <Field label="Relationship" value={ent.next_of_kin_relationship} />
              <Field label="Phone Number" value={ent.next_of_kin_phone} />
              <Field label="Email Address" value={ent.next_of_kin_email} />
            </div>
          </Section>

          {/* Admin-Only Section */}
          <Section title="Admin Notes (Internal)">
            <Field label="PM Comments & Observations" value={ent.industry_analysis} />
            <Field label="Risk Flags" value={ent.risk_flags} />
            <Field label="Recommended Coach Profile" value={ent.recommended_coach_profile} />
          </Section>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
