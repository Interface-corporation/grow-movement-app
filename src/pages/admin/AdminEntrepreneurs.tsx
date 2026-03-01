import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Loader2, X } from 'lucide-react';
import { sectors, countries, stages } from '@/data/mockEntrepreneurs';
import { logActivity } from '@/lib/activityLog';
import FileUpload from '@/components/FileUpload';

const communicationOptions = ['Email', 'WhatsApp', 'Phone Call', 'SMS', 'Zoom/Video Call'];

const emptyForm = {
  name: '', photo_url: '', business_name: '', country: '', sector: '', stage: '',
  gender: '', pitch_summary: '', business_description: '', funding_needs: '',
  coaching_needs: '', revenue: '', year_founded: '', team_size: '', status: 'Admitted',
  email: '', phone: '', next_of_kin: '', preferred_communication: '',
  education_background: '', about_entrepreneur: '', website: '', video_url: '',
  employees_fulltime: '', employees_parttime: '', impact: '', financials: '',
  financial_recording_method: '', products_services: '', market_size: '',
  competition: '', top_challenges: '', main_challenge: '', opportunities: '',
  industry_analysis: '', linkedin: '', program_id: '',
};

export default function AdminEntrepreneurs() {
  const { user, userRole, programId } = useAuth();
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [programs, setPrograms] = useState<any[]>([]);
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('entrepreneurs').select('*', { count: 'exact' });
    if (search) query = query.or(`name.ilike.%${search}%,business_name.ilike.%${search}%`);
    if (filterSector) query = query.eq('sector', filterSector);
    // Program admin filtering
    if (userRole === 'program_admin' && programId) {
      query = query.eq('program_id', programId);
    }
    const { data, count } = await query.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setEntrepreneurs(data || []);
    setTotal(count ?? 0);

    // Fetch programs for dropdown
    const { data: progs } = await supabase.from('programs').select('id, name');
    setPrograms(progs || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, filterSector]);

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      name: form.name, photo_url: form.photo_url || null, business_name: form.business_name,
      country: form.country, sector: form.sector, stage: form.stage, gender: form.gender,
      pitch_summary: form.pitch_summary || null, business_description: form.business_description || null,
      funding_needs: form.funding_needs || null, coaching_needs: form.coaching_needs || null,
      revenue: form.revenue || null, status: form.status, created_by: user?.id,
      year_founded: form.year_founded ? parseInt(form.year_founded) : null,
      team_size: form.team_size ? parseInt(form.team_size) : null,
      email: form.email || null, phone: form.phone || null, next_of_kin: form.next_of_kin || null,
      preferred_communication: form.preferred_communication || null,
      education_background: form.education_background || null,
      about_entrepreneur: form.about_entrepreneur || null,
      website: form.website || null, video_url: form.video_url || null,
      employees_fulltime: form.employees_fulltime ? parseInt(form.employees_fulltime) : null,
      employees_parttime: form.employees_parttime ? parseInt(form.employees_parttime) : null,
      impact: form.impact || null, financials: form.financials || null,
      financial_recording_method: form.financial_recording_method || null,
      products_services: form.products_services || null, market_size: form.market_size || null,
      competition: form.competition || null, top_challenges: form.top_challenges || null,
      main_challenge: form.main_challenge || null, opportunities: form.opportunities || null,
      industry_analysis: form.industry_analysis || null, linkedin: form.linkedin || null,
      program_id: form.program_id || (userRole === 'program_admin' ? programId : null),
    };

    if (editing) {
      await supabase.from('entrepreneurs').update(payload).eq('id', editing);
      await logActivity('Updated entrepreneur', 'entrepreneur', editing, { name: form.name });
    } else {
      const { data: inserted } = await supabase.from('entrepreneurs').insert(payload).select('id').single();
      await logActivity('Created entrepreneur', 'entrepreneur', inserted?.id, { name: form.name });
    }
    setSaving(false); setShowForm(false); setEditing(null); setForm(emptyForm); setActiveTab(0); fetchData();
  };

  const handleEdit = (ent: any) => {
    setForm({
      name: ent.name || '', photo_url: ent.photo_url || '', business_name: ent.business_name || '',
      country: ent.country || '', sector: ent.sector || '', stage: ent.stage || '', gender: ent.gender || '',
      pitch_summary: ent.pitch_summary || '', business_description: ent.business_description || '',
      funding_needs: ent.funding_needs || '', coaching_needs: ent.coaching_needs || '',
      revenue: ent.revenue || '', year_founded: ent.year_founded?.toString() || '',
      team_size: ent.team_size?.toString() || '', status: ent.status || 'Admitted',
      email: ent.email || '', phone: ent.phone || '', next_of_kin: ent.next_of_kin || '',
      preferred_communication: ent.preferred_communication || '',
      education_background: ent.education_background || '', about_entrepreneur: ent.about_entrepreneur || '',
      website: ent.website || '', video_url: ent.video_url || '',
      employees_fulltime: ent.employees_fulltime?.toString() || '',
      employees_parttime: ent.employees_parttime?.toString() || '',
      impact: ent.impact || '', financials: ent.financials || '',
      financial_recording_method: ent.financial_recording_method || '',
      products_services: ent.products_services || '', market_size: ent.market_size || '',
      competition: ent.competition || '', top_challenges: ent.top_challenges || '',
      main_challenge: ent.main_challenge || '', opportunities: ent.opportunities || '',
      industry_analysis: ent.industry_analysis || '', linkedin: ent.linkedin || '',
      program_id: ent.program_id || '',
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
  const tabs = ['General Info', 'Contact & Background', 'Business Overview', 'Financials','Market & Competition'];
  const getProgramName = (id: string | null) => programs.find(p => p.id === id)?.name || '—';

  const f = (key: string, placeholder: string, type = 'text') => (
    <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
      placeholder={placeholder} type={type}
      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
  );
  const ta = (key: string, placeholder: string, rows = 2) => (
    <textarea value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
      placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold">Entrepreneurs ({total})</h2>
        <Button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); setActiveTab(0); }} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Entrepreneur
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filterSector} onChange={(e) => { setFilterSector(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm">
          <option value="">All Sectors</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Entrepreneur</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-border">
              {tabs.map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(i)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {f('name', 'Full Name *')}
                {f('business_name', 'Business Name *')}
                <div className="sm:col-span-2">
                  <FileUpload bucket="profile-photos" accept="image/*" label="Profile Photo" currentUrl={form.photo_url}
                    onUpload={(url) => setForm({ ...form, photo_url: url })} onRemove={() => setForm({ ...form, photo_url: '' })} />
                </div>
                <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Country *</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Sector *</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Stage *</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Gender *</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="Pending">Pending</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Matched">Matched</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {/* Program Assignment Dropdown */}
                {userRole === 'admin' && (
                  <select value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option value="">No Program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
                {f('video_url', 'Video URL (YouTube or other)')}
                {f('website', 'Website / Online Presence')}
              </div>
            )}

            {activeTab === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {f('email', 'Email Address', 'email')}
                {f('phone', 'Phone Number')}
                {f('linkedin', 'LinkedIn Profile URL')}
                {f('next_of_kin', 'Next of Kin (Name & Contact)')}
                <select value={form.preferred_communication} onChange={e => setForm({ ...form, preferred_communication: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Preferred Communication</option>
                  {communicationOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {f('education_background', 'Education Background')}
                <div className="sm:col-span-2">{ta('about_entrepreneur', 'Brief info about the entrepreneur', 3)}</div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* {f('revenue', 'Revenue (e.g. $50,000/year)')} */}
                  {f('year_founded', 'Year Founded', 'number')}
                  {/* {f('employees_fulltime', 'Full-time Employees', 'number')} */}
                  {/* {f('employees_parttime', 'Part-time Employees', 'number')} */}
                  {f('team_size', 'Total Team Size', 'number')}
                  {/* {f('financial_recording_method', 'How they record financials')} */}
                </div>
                {/* {ta('pitch_summary', 'Pitch Summary', 2)} */}
                {ta('business_description', 'Business Model / Activities Summary', 3)}
                {ta('products_services', 'Products & Services (breakdown, prices, target customers)', 3)}
                {/* {ta('financials', 'Financials (turnover, investments, estimations)', 2)} */}
                {ta('impact', 'Social or Environmental Impact', 2)}
                {ta('funding_needs', 'Funding Needs', 2)}
                {ta('coaching_needs', 'Coaching / Support Needs', 2)}
              </div>
            )}
            {activeTab === 3 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {f('revenue', 'Estimated Revenue (e.g. $50,000/year)')}
                  {f('financial_recording_method', 'How they record financials')}
                </div>
                {ta('financials', 'estimated investment and estimated expenses (e.g. $40,000 investment, $25,000 estimated expenses)', 2)}
               
              </div>
            )}

            {activeTab === 4 && (
              <div className="space-y-3">
                {ta('market_size', 'Market Size (local/export, marketing strategies, distribution, payment methods, target customers)', 3)}
                {ta('competition', 'Competition & Competitive Advantages / How unique is the solution', 3)}
                {ta('top_challenges', ' Challenges and Needs', 3)}
                {/* {ta('main_challenge', 'If you had to pick 1 challenge or opportunity to support on, what would it be?', 2)} */}
                {ta('opportunities', 'Opportunities for the business & 3-year vision', 3)}
                {ta('industry_analysis', 'Project Manager comment', 4)}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {activeTab > 0 && (
                <Button variant="outline" onClick={() => setActiveTab(activeTab - 1)} className="flex-1">Previous</Button>
              )}
              {activeTab < tabs.length - 1 ? (
                <Button onClick={() => setActiveTab(activeTab + 1)} className="flex-1 bg-primary text-primary-foreground">Next</Button>
              ) : (
                <Button onClick={handleSave}
                  disabled={saving || !form.name || !form.business_name || !form.country || !form.sector || !form.stage || !form.gender}
                  className="flex-1 bg-primary text-primary-foreground">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
                      }`}>
                        {ent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(ent)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(ent.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
