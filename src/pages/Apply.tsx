import { useState, useCallback } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, ArrowLeft, Plus, X } from 'lucide-react';
import { sectors, countries, stages, qualifications, socialMediaPlatforms, workTypes } from '@/data/mockEntrepreneurs';
import FileUpload from '@/components/FileUpload';
import { toast } from 'sonner';

const emptyForm = {
  name: '', gender: '', photo_url: '', country: '', town_city: '',
  mobile_number: '', whatsapp_number: '', email: '', role_in_business: '',
  languages_spoken: '', about_entrepreneur: '', highest_qualification: '',
  business_name: '', stage: '', video_url: '', sector: '', products_services: '',
  how_making_money: '', problem_solving: '', impact: '', achievements_12_months: '',
  team_size: '', technology_ai_used: '', tech_challenges: '', work_type: '',
  pitch_deck_url: '',
  main_customers: '', international_customers: '', international_customer_details: '',
  marketing_methods: '', website: '', social_media_links: '[]',
  competition: '', competitive_advantages: '', market_trends: '',
  total_investment: '', financial_recording_method: '', estimated_revenue_24m: '',
  estimated_expenses_24m: '', highest_costs: '',
  business_vision: '', other_businesses: '', other_businesses_details: '',
  top_challenges: '', top_3_opportunities: '', coaching_needs: '',
  areas_help_details: '', top_3_skills: '', desired_coach_background: '',
  next_of_kin_name: '', next_of_kin_relationship: '', next_of_kin_phone: '',
  next_of_kin_email: '',
};

export default function Apply() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [countrySearch, setCountrySearch] = useState('');
  const { clearAutoSave } = useAutoSave('apply_entrepreneur', form, setForm, !submitted);

  const tabs = ['General Info', 'Business Overview', 'Basic Financials', 'Market & Competition', 'Coaching & Mentoring'];

  const validate = (): boolean => {
    if (!form.name.trim()) { setError('Full Name is required'); setActiveTab(0); return false; }
    if (!form.gender) { setError('Gender is required'); setActiveTab(0); return false; }
    if (!form.country) { setError('Country is required'); setActiveTab(0); return false; }
    if (!form.email.trim()) { setError('Email Address is required'); setActiveTab(0); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Please enter a valid email address'); setActiveTab(0); return false; }
    if (!form.business_name.trim()) { setError('Business Name is required'); setActiveTab(1); return false; }
    if (!form.sector) { setError('Business Sector is required'); setActiveTab(1); return false; }
    if (!form.stage) { setError('Stage of Business is required'); setActiveTab(1); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setError('');
    setSubmitting(true);

    try {
      const { error: dbError } = await supabase.from('entrepreneurs').insert({
        name: form.name.trim(), gender: form.gender, country: form.country,
        town_city: form.town_city.trim() || null,
        mobile_number: form.mobile_number.trim() || null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        email: form.email.trim().toLowerCase(),
        phone: form.mobile_number.trim() || null,
        role_in_business: form.role_in_business.trim() || null,
        languages_spoken: form.languages_spoken.trim() || null,
        about_entrepreneur: form.about_entrepreneur.trim() || null,
        highest_qualification: form.highest_qualification || null,
        education_background: form.highest_qualification || null,
        photo_url: form.photo_url || null,
        business_name: form.business_name.trim(), stage: form.stage, sector: form.sector,
        video_url: form.video_url.trim() || null,
        products_services: form.products_services.trim() || null,
        business_description: form.products_services.trim() || null,
        how_making_money: form.how_making_money.trim() || null,
        problem_solving: form.problem_solving.trim() || null,
        pitch_summary: form.problem_solving.trim() || null,
        impact: form.impact.trim() || null,
        achievements_12_months: form.achievements_12_months.trim() || null,
        team_size: form.team_size ? parseInt(form.team_size) : null,
        technology_ai_used: form.technology_ai_used.trim() || null,
        tech_challenges: form.tech_challenges.trim() || null,
        work_type: form.work_type || null,
        pitch_deck_url: form.pitch_deck_url || null,
        main_customers: form.main_customers.trim() || null,
        market_size: form.main_customers.trim() || null,
        international_customers: form.international_customers || null,
        international_customer_details: form.international_customer_details.trim() || null,
        marketing_methods: form.marketing_methods.trim() || null,
        website: form.website.trim() || null,
        social_media_links: form.social_media_links || '[]',
        competition: form.competition.trim() || null,
        competitive_advantages: form.competitive_advantages.trim() || null,
        market_trends: form.market_trends.trim() || null,
        total_investment: form.total_investment.trim() || null,
        financials: form.total_investment.trim() || null,
        financial_recording_method: form.financial_recording_method.trim() || null,
        estimated_revenue_24m: form.estimated_revenue_24m.trim() || null,
        revenue: form.estimated_revenue_24m.trim() || null,
        estimated_expenses_24m: form.estimated_expenses_24m.trim() || null,
        highest_costs: form.highest_costs.trim() || null,
        business_vision: form.business_vision.trim() || null,
        opportunities: form.business_vision.trim() || null,
        other_businesses: form.other_businesses || null,
        other_businesses_details: form.other_businesses_details.trim() || null,
        top_challenges: form.top_challenges.trim() || null,
        top_3_opportunities: form.top_3_opportunities.trim() || null,
        coaching_needs: form.coaching_needs.trim() || null,
        areas_help_details: form.areas_help_details.trim() || null,
        top_3_skills: form.top_3_skills.trim() || null,
        desired_coach_background: form.desired_coach_background.trim() || null,
        next_of_kin_name: form.next_of_kin_name.trim() || null,
        next_of_kin: form.next_of_kin_name.trim() || null,
        next_of_kin_relationship: form.next_of_kin_relationship.trim() || null,
        next_of_kin_phone: form.next_of_kin_phone.trim() || null,
        next_of_kin_email: form.next_of_kin_email.trim() || null,
        status: 'Pending',
      });

      if (dbError) {
        if (dbError.message?.includes('duplicate') || dbError.message?.includes('unique')) {
          setError('An application with this email already exists.');
        } else {
          setError('Failed to submit. Please try again.');
        }
        toast.error('Submission failed');
      } else {
        setSubmitted(true);
        toast.success('Application submitted successfully!');
      }
    } catch {
      setError('An unexpected error occurred.');
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20 max-w-lg">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Application Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to the Grow Movement program! Our team will review your application and get back to you within 5-7 business days.
          </p>
          <Link to="/"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const filteredCountries = countrySearch
    ? countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries;

  const socialLinks = (() => {
    try { return JSON.parse(form.social_media_links || '[]'); } catch { return []; }
  })();
  const addSocialLink = () => {
    const updated = [...socialLinks, { platform: '', url: '' }];
    setForm({ ...form, social_media_links: JSON.stringify(updated) });
  };
  const updateSocialLink = (i: number, key: string, val: string) => {
    const updated = [...socialLinks];
    updated[i] = { ...updated[i], [key]: val };
    setForm({ ...form, social_media_links: JSON.stringify(updated) });
  };
  const removeSocialLink = (i: number) => {
    const updated = socialLinks.filter((_: any, idx: number) => idx !== i);
    setForm({ ...form, social_media_links: JSON.stringify(updated) });
  };

  const f = (key: string, label: string, required = false, type = 'text', placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}{required && ' *'}</label>
      <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder || label} type={type}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
  const ta = (key: string, label: string, rows = 3, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <textarea value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder || label} rows={rows}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
  const sel = (key: string, label: string, options: string[], required = false) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}{required && ' *'}</label>
      <select value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm">
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Apply to Grow Movement</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join our program and connect with coaches, mentors, and investors who can help you grow your business.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          {/* Progress */}
          <div className="flex items-center gap-1 mb-6">
            {tabs.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= activeTab ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 0: General Info */}
          {activeTab === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {f('name', 'Full Name', true)}
              {sel('gender', 'Gender', ['Male', 'Female', 'Non-binary'], true)}
              <div className="sm:col-span-2">
                <FileUpload bucket="profile-photos" accept="image/*" maxSizeMB={1} label="Profile Photo (Max 1MB)" currentUrl={form.photo_url}
                  onUpload={(url) => setForm({ ...form, photo_url: url })} onRemove={() => setForm({ ...form, photo_url: '' })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Country *</label>
                <input placeholder="Search country..." value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-t-xl border border-border bg-card text-sm" />
                <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-b-xl border border-t-0 border-border bg-card text-sm">
                  <option value="">Select Country</option>
                  {filteredCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {f('town_city', 'Town / City')}
              {f('mobile_number', 'Mobile Number', false, 'tel', '+XXX XXXXXXXXX')}
              {f('whatsapp_number', 'WhatsApp Number', false, 'tel', '+XXX XXXXXXXXX')}
              {f('email', 'Email Address', true, 'email')}
              {f('role_in_business', 'Role in Business')}
              {f('languages_spoken', 'Languages Spoken', false, 'text', 'e.g. English, French, Swahili')}
              {sel('highest_qualification', 'Highest Qualification', qualifications)}
              <div className="sm:col-span-2">{ta('about_entrepreneur', 'Brief info about the entrepreneur')}</div>
            </div>
          )}

          {/* Tab 1: Business Overview */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {f('business_name', 'Business Name', true)}
                {sel('stage', 'Stage of Business', stages, true)}
                {f('video_url', 'Profile YouTube Video Link')}
                {sel('sector', 'Business Sector', sectors, true)}
                {f('team_size', 'Total employees (Full time + Part time)', false, 'number')}
                {sel('work_type', 'Working Part time or Full time?', workTypes)}
              </div>
              {ta('products_services', 'What does your business do? What are you offering your customers?')}
              {ta('how_making_money', 'How are you making money?')}
              {ta('problem_solving', 'What problem are you solving?')}
              {ta('impact', 'What impact does your business have on the community or environment?')}
              {ta('achievements_12_months', 'What are the achievements made for the last 12 months?')}
              {ta('technology_ai_used', 'What technology or AI do you use in your business?')}
              {ta('tech_challenges', 'State any technological challenges or opportunities you have')}
              <FileUpload bucket="pitch-decks" accept=".pdf,.ppt,.pptx" maxSizeMB={5} label="Pitch Deck (PDF/PPT, max 5MB)" currentUrl={form.pitch_deck_url}
                onUpload={(url) => setForm({ ...form, pitch_deck_url: url })} onRemove={() => setForm({ ...form, pitch_deck_url: '' })} />
            </div>
          )}

          {/* Tab 2: Basic Financials */}
          {activeTab === 2 && (
            <div className="space-y-4">
              {f('total_investment', 'What is the total investment in the business so far? (estimate is ok)')}
              {ta('financial_recording_method', 'How do you keep financial records?', 2)}
              {f('estimated_revenue_24m', 'Estimated total revenue over the last 24 months')}
              {f('estimated_expenses_24m', 'Estimated total expenses over the last 24 months')}
              {ta('highest_costs', 'What are the highest estimated total costs in your business?', 2)}
            </div>
          )}

          {/* Tab 3: Market & Competition */}
          {activeTab === 3 && (
            <div className="space-y-4">
              {ta('main_customers', 'Who are the main customers of your business?')}
              {sel('international_customers', 'Do you have any international customers?', ['Yes', 'No'])}
              {form.international_customers === 'Yes' && ta('international_customer_details', 'International/Export customer details')}
              {ta('marketing_methods', 'How do you market your business to customers?')}
              {f('website', 'Business Website (If applicable)')}
              {/* Social Media Links */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Other Social Media Links (If applicable)</label>
                {socialLinks.map((link: any, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={link.platform} onChange={e => updateSocialLink(i, 'platform', e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm w-40">
                      <option value="">Platform</option>
                      {socialMediaPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input value={link.url} onChange={e => updateSocialLink(i, 'url', e.target.value)}
                      placeholder="https://..." className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
                    <button onClick={() => removeSocialLink(i)} className="text-destructive hover:bg-destructive/10 rounded-lg p-2">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                  <Plus className="h-3 w-3 mr-1" /> Add Social Link
                </Button>
              </div>
              {ta('competition', 'Who are the main competitors (Direct/Indirect) for your business?')}
              {ta('competitive_advantages', 'How are you different from your competition?')}
              {ta('market_trends', 'What market trends affect the business?')}
            </div>
          )}

          {/* Tab 4: Coaching & Mentoring */}
          {activeTab === 4 && (
            <div className="space-y-4">
              {ta('business_vision', 'Where do you see your business in the next 3-5 years?')}
              {sel('other_businesses', 'Do you have any other businesses?', ['Yes', 'No'])}
              {form.other_businesses === 'Yes' && ta('other_businesses_details', 'If yes, please specify what businesses')}
              {ta('top_challenges', 'What are the 3 biggest challenges you face in your business today?')}
              {ta('top_3_opportunities', 'What are the 3 biggest top opportunities?')}
              {ta('coaching_needs', 'What areas do you need the most help with?')}
              {ta('areas_help_details', 'Please explain further on the areas you need help with')}
              {ta('top_3_skills', 'What top 3 skills development needs would you like to grow and develop?')}
              {ta('desired_coach_background', 'What kind of background or experience would you want your mentor or coach to have?')}
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="text-base font-bold text-foreground mb-3">Next of Kin</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {f('next_of_kin_name', 'Full Name of Next of Kin')}
                  {f('next_of_kin_relationship', 'Relationship to You')}
                  {f('next_of_kin_phone', 'Phone Number (include country code)', false, 'tel')}
                  {f('next_of_kin_email', 'Email Address of Next of Kin', false, 'email')}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm bg-destructive/10 text-destructive p-3 rounded-lg">{error}</div>
          )}

          <div className="flex gap-3 mt-6">
            {activeTab > 0 && (
              <Button variant="outline" onClick={() => setActiveTab(activeTab - 1)} className="flex-1">Previous</Button>
            )}
            {activeTab < tabs.length - 1 ? (
              <Button onClick={() => setActiveTab(activeTab + 1)} className="flex-1 bg-primary text-primary-foreground">Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-primary text-primary-foreground">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
