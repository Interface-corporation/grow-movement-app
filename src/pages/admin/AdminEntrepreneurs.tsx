import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Loader2, X, Eye, RotateCcw } from 'lucide-react';
import { sectors, countries, stages, qualifications, socialMediaPlatforms, workTypes } from '@/data/mockEntrepreneurs';
import { logActivity } from '@/lib/activityLog';
import FileUpload from '@/components/FileUpload';
import EntrepreneurViewModal from '@/components/admin/EntrepreneurViewModal';
import { toast } from 'sonner';
import { useAutoSave } from '@/hooks/useAutoSave';

const emptyForm = {
  name: '', gender: '', program_id: '', photo_url: '', country: '', town_city: '',
  mobile_number: '', whatsapp_number: '', email: '', role_in_business: '',
  languages_spoken: '', about_entrepreneur: '', highest_qualification: '',
  // Business Overview
  business_name: '', stage: '', video_url: '', sector: '', products_services: '',
  how_making_money: '', problem_solving: '', impact: '', achievements_12_months: '',
  team_size: '', technology_ai_used: '', tech_challenges: '', work_type: '',
  pitch_deck_url: '',
  // Market & Competition
  main_customers: '', international_customers: '', international_customer_details: '',
  marketing_methods: '', website: '', social_media_links: '[]',
  competition: '', competitive_advantages: '', market_trends: '',
  // Basic Financials
  total_investment: '', financial_recording_method: '', estimated_revenue_24m: '',
  estimated_expenses_24m: '', highest_costs: '',
  // Coaching & Mentoring
  business_vision: '', other_businesses: '', other_businesses_details: '',
  top_challenges: '', top_3_opportunities: '', coaching_needs: '',
  areas_help_details: '', top_3_skills: '', desired_coach_background: '',
  next_of_kin_name: '', next_of_kin_relationship: '', next_of_kin_phone: '',
  next_of_kin_email: '',
  // Admin-only
  status: 'Pending', industry_analysis: '', risk_flags: '', recommended_coach_profile: '',
  // Legacy fields (keep for backward compat)
  revenue: '', year_founded: '', funding_needs: '', linkedin: '',
  phone: '', education_background: '', next_of_kin: '',
};

export default function AdminEntrepreneurs() {
  const { user, userRole, programId } = useAuth();
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [programs, setPrograms] = useState<any[]>([]);
  const [viewEnt, setViewEnt] = useState<any>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('entrepreneurs').select('*', { count: 'exact' });
    if (search) query = query.or(`name.ilike.%${search}%,business_name.ilike.%${search}%`);
    if (filterSector) query = query.eq('sector', filterSector);
    if (filterProgram) query = query.eq('program_id', filterProgram);
    if (userRole === 'program_admin' && programId) query = query.eq('program_id', programId);
    const { data, count } = await query.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setEntrepreneurs(data || []);
    setTotal(count ?? 0);
    const { data: progs } = await supabase.from('programs').select('id, name');
    setPrograms(progs || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, filterSector, filterProgram]);

  const validate = () => {
    if (!form.name.trim()) { toast.error('Full Name is required'); setActiveTab(0); return false; }
    if (!form.gender) { toast.error('Gender is required'); setActiveTab(0); return false; }
    if (!form.country) { toast.error('Country is required'); setActiveTab(0); return false; }
    if (!form.email.trim()) { toast.error('Email is required'); setActiveTab(0); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { toast.error('Invalid email address'); setActiveTab(0); return false; }
    if (!form.business_name.trim()) { toast.error('Business Name is required'); setActiveTab(1); return false; }
    if (!form.sector) { toast.error('Business Sector is required'); setActiveTab(1); return false; }
    if (!form.stage) { toast.error('Stage of Business is required'); setActiveTab(1); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload: any = {
      name: form.name.trim(), gender: form.gender, country: form.country,
      town_city: form.town_city.trim() || null,
      mobile_number: form.mobile_number.trim() || null,
      whatsapp_number: form.whatsapp_number.trim() || null,
      email: form.email.trim().toLowerCase(),
      role_in_business: form.role_in_business.trim() || null,
      languages_spoken: form.languages_spoken.trim() || null,
      about_entrepreneur: form.about_entrepreneur.trim() || null,
      highest_qualification: form.highest_qualification || null,
      education_background: form.highest_qualification || form.education_background || null,
      photo_url: form.photo_url || null,
      business_name: form.business_name.trim(), stage: form.stage, sector: form.sector,
      video_url: form.video_url.trim() || null,
      products_services: form.products_services.trim() || null,
      how_making_money: form.how_making_money.trim() || null,
      problem_solving: form.problem_solving.trim() || null,
      pitch_summary: form.problem_solving.trim() || null,
      business_description: form.products_services.trim() || null,
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
      status: form.status,
      industry_analysis: form.industry_analysis.trim() || null,
      risk_flags: form.risk_flags.trim() || null,
      recommended_coach_profile: form.recommended_coach_profile.trim() || null,
      program_id: form.program_id || (userRole === 'program_admin' ? programId : null),
      created_by: user?.id,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('entrepreneurs').update(payload).eq('id', editing);
        if (error) throw error;
        await logActivity('Updated entrepreneur', 'entrepreneur', editing, { name: form.name });
        toast.success('Entrepreneur updated');
      } else {
        const { data: inserted, error } = await supabase.from('entrepreneurs').insert(payload).select('id').single();
        if (error) throw error;
        await logActivity('Created entrepreneur', 'entrepreneur', inserted?.id, { name: form.name });
        toast.success('Entrepreneur created');
      }
      setShowForm(false); setEditing(null); setForm(emptyForm); setActiveTab(0); fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ent: any) => {
    setForm({
      name: ent.name || '', gender: ent.gender || '', program_id: ent.program_id || '',
      photo_url: ent.photo_url || '', country: ent.country || '', town_city: ent.town_city || '',
      mobile_number: ent.mobile_number || ent.phone || '', whatsapp_number: ent.whatsapp_number || '',
      email: ent.email || '', role_in_business: ent.role_in_business || '',
      languages_spoken: ent.languages_spoken || '', about_entrepreneur: ent.about_entrepreneur || '',
      highest_qualification: ent.highest_qualification || ent.education_background || '',
      business_name: ent.business_name || '', stage: ent.stage || '', video_url: ent.video_url || '',
      sector: ent.sector || '', products_services: ent.products_services || ent.business_description || '',
      how_making_money: ent.how_making_money || '', problem_solving: ent.problem_solving || ent.pitch_summary || '',
      impact: ent.impact || '', achievements_12_months: ent.achievements_12_months || '',
      team_size: ent.team_size?.toString() || '', technology_ai_used: ent.technology_ai_used || '',
      tech_challenges: ent.tech_challenges || '', work_type: ent.work_type || '',
      pitch_deck_url: ent.pitch_deck_url || '',
      main_customers: ent.main_customers || ent.market_size || '',
      international_customers: ent.international_customers || '',
      international_customer_details: ent.international_customer_details || '',
      marketing_methods: ent.marketing_methods || '', website: ent.website || '',
      social_media_links: ent.social_media_links || '[]',
      competition: ent.competition || '', competitive_advantages: ent.competitive_advantages || '',
      market_trends: ent.market_trends || '',
      total_investment: ent.total_investment || ent.financials || '',
      financial_recording_method: ent.financial_recording_method || '',
      estimated_revenue_24m: ent.estimated_revenue_24m || ent.revenue || '',
      estimated_expenses_24m: ent.estimated_expenses_24m || '', highest_costs: ent.highest_costs || '',
      business_vision: ent.business_vision || ent.opportunities || '',
      other_businesses: ent.other_businesses || '', other_businesses_details: ent.other_businesses_details || '',
      top_challenges: ent.top_challenges || '', top_3_opportunities: ent.top_3_opportunities || '',
      coaching_needs: ent.coaching_needs || '', areas_help_details: ent.areas_help_details || ent.main_challenge || '',
      top_3_skills: ent.top_3_skills || '', desired_coach_background: ent.desired_coach_background || '',
      next_of_kin_name: ent.next_of_kin_name || ent.next_of_kin || '',
      next_of_kin_relationship: ent.next_of_kin_relationship || '',
      next_of_kin_phone: ent.next_of_kin_phone || '', next_of_kin_email: ent.next_of_kin_email || '',
      status: ent.status || 'Pending', industry_analysis: ent.industry_analysis || '',
      risk_flags: ent.risk_flags || '', recommended_coach_profile: ent.recommended_coach_profile || '',
      revenue: ent.revenue || '', year_founded: ent.year_founded?.toString() || '',
      funding_needs: ent.funding_needs || '', linkedin: ent.linkedin || '',
      phone: ent.phone || '', education_background: ent.education_background || '',
      next_of_kin: ent.next_of_kin || '',
    });
    setEditing(ent.id); setShowForm(true); setActiveTab(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entrepreneur?')) return;
    const ent = entrepreneurs.find(e => e.id === id);
    await supabase.from('entrepreneurs').delete().eq('id', id);
    await logActivity('Deleted entrepreneur', 'entrepreneur', id, { name: ent?.name });
    fetchData();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const tabs = ['General Info', 'Business Overview', 'Basic Financials', 'Market & Competition', 'Coaching & Mentoring', 'Admin Notes'];
  const getProgramName = (id: string | null) => programs.find(p => p.id === id)?.name || '—';

  const filteredCountries = countrySearch
    ? countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries;

  // Social media links helpers
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
      <label className="block text-xs font-medium text-foreground mb-1">{label}{required && ' *'}</label>
      <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder || label} type={type}
        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
  const ta = (key: string, label: string, rows = 3, placeholder?: string) => (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
      <textarea value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder || label} rows={rows}
        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
  const sel = (key: string, label: string, options: string[], required = false, placeholder?: string) => (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">{label}{required && ' *'}</label>
      <select value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold">Entrepreneurs ({total})</h2>
        <Button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); setActiveTab(0); }} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Entrepreneur
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm" />
        </div>
        <select value={filterSector} onChange={e => { setFilterSector(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
          <option value="">All Sectors</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {programs.length > 0 && (
          <select value={filterProgram} onChange={e => { setFilterProgram(e.target.value); setPage(0); }}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
            <option value="">All Programs</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* View Modal */}
      {viewEnt && (
        <EntrepreneurViewModal entrepreneur={viewEnt} programName={getProgramName(viewEnt.program_id)} onClose={() => setViewEnt(null)} />
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Entrepreneur</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
              {tabs.map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(i)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 0: General Info */}
            {activeTab === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {f('name', 'Full Name', true)}
                {sel('gender', 'Gender', ['Male', 'Female', 'Non-binary'], true)}
                <div className="sm:col-span-2">
                  <FileUpload bucket="profile-photos" accept="image/*" maxSizeMB={1} label="Profile Photo (Max 1MB)" currentUrl={form.photo_url}
                    onUpload={(url) => setForm({ ...form, photo_url: url })} onRemove={() => setForm({ ...form, photo_url: '' })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Country *</label>
                  <input placeholder="Search country..." value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-t-xl border border-border bg-background text-sm mb-0" />
                  <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-b-xl border border-t-0 border-border bg-background text-sm" size={1}>
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {f('business_name', 'Business Name', true)}
                  {sel('stage', 'Stage of Business', stages, true)}
                  {f('video_url', 'Profile YouTube Video Link')}
                  {sel('sector', 'Business Sector', sectors, true)}
                  {f('team_size', 'Total number of employees (Full time + Part time)', false, 'number')}
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
              <div className="space-y-3">
                {f('total_investment', 'What is the total investment in the business so far? (estimate is ok)')}
                {ta('financial_recording_method', 'How do you keep financial records?', 2)}
                {f('estimated_revenue_24m', 'Estimated total revenue generated over the last 24 months')}
                {f('estimated_expenses_24m', 'Estimated total expenses made over the last 24 months')}
                {ta('highest_costs', 'What are the highest estimated total costs in your business?', 2)}
              </div>
            )}

            {/* Tab 3: Market & Competition */}
            {activeTab === 3 && (
              <div className="space-y-3">
                {ta('main_customers', 'Who are the main customers of your business?')}
                {sel('international_customers', 'Do you have any international customers?', ['Yes', 'No'])}
                {form.international_customers === 'Yes' && ta('international_customer_details', 'International/Export customer details')}
                {ta('marketing_methods', 'How do you market your business to customers?')}
                {f('website', 'Business Website (If applicable)')}
                {/* Social Media Links */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Other Social Media Links</label>
                  {socialLinks.map((link: any, i: number) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select value={link.platform} onChange={e => updateSocialLink(i, 'platform', e.target.value)}
                        className="px-3 py-2 rounded-xl border border-border bg-background text-sm w-40">
                        <option value="">Platform</option>
                        {socialMediaPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input value={link.url} onChange={e => updateSocialLink(i, 'url', e.target.value)}
                        placeholder="https://..." className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm" />
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
                {ta('competitive_advantages', 'How are you different from your competition (competitive advantages)?')}
                {ta('market_trends', 'What market trends affect the business?')}
              </div>
            )}

            {/* Tab 4: Coaching & Mentoring */}
            {activeTab === 4 && (
              <div className="space-y-3">
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
                  <h4 className="text-sm font-bold text-foreground mb-3">Next of Kin</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {f('next_of_kin_name', 'Full Name of Next of Kin')}
                    {f('next_of_kin_relationship', 'Relationship to You')}
                    {f('next_of_kin_phone', 'Phone Number (include country code)', false, 'tel')}
                    {f('next_of_kin_email', 'Email Address of Next of Kin', false, 'email')}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Admin Notes (admin-only) */}
            {activeTab === 5 && (
              <div className="space-y-3">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ These fields are only visible to administrators and will not appear on the public application form.
                </div>
                {sel('status', 'Application Status', ['Pending', 'Admitted', 'Matched', 'Alumni', 'Rejected'])}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Programme</label>
                  <select value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option value="">No Program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {ta('industry_analysis', 'Grow Movement PM – Comments and Observations', 4)}
                {ta('risk_flags', 'Risk Flags', 3)}
                {ta('recommended_coach_profile', 'Recommended Coach Profile', 3)}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {activeTab > 0 && (
                <Button variant="outline" onClick={() => setActiveTab(activeTab - 1)} className="flex-1">Previous</Button>
              )}
              {activeTab < tabs.length - 1 ? (
                <Button onClick={() => setActiveTab(activeTab + 1)} className="flex-1 bg-primary text-primary-foreground">Next</Button>
              ) : (
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editing ? 'Update' : 'Create'} Entrepreneur
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Business</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Country</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Sector</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Program</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entrepreneurs.map(ent => (
                  <tr key={ent.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{ent.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ent.business_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{ent.country}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{ent.sector}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{getProgramName(ent.program_id)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        ent.status === 'Alumni' ? 'bg-accent/10 text-accent' :
                        ent.status === 'Admitted' ? 'bg-grow-gold/10 text-grow-gold' :
                        ent.status === 'Matched' ? 'bg-primary/10 text-primary' :
                        ent.status === 'Pending' ? 'bg-muted text-muted-foreground' :
                        'bg-destructive/10 text-destructive'
                      }`}>{ent.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setViewEnt(ent)} title="View details"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(ent)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(ent.id)} className="text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {entrepreneurs.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No entrepreneurs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
