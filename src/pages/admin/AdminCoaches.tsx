import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Loader2, X } from 'lucide-react';
import { countries } from '@/data/mockEntrepreneurs';
import { logActivity } from '@/lib/activityLog';

const communicationOptions = ['Email', 'WhatsApp', 'Phone Call', 'SMS', 'Zoom/Video Call'];

const emptyForm = {
  name: '', photo_url: '', email: '', phone: '', organization: '',
  specialization: '', country: '', bio: '', status: 'Accepted',
  linkedin: '', preferred_client_type: '', experience: '',
  availability: '', preferred_communication: '',
};

export default function AdminCoaches() {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('coaches').select('*', { count: 'exact' });
    if (search) query = query.or(`name.ilike.%${search}%,organization.ilike.%${search}%`);
    const { data, count } = await query.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setCoaches(data || []);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      name: form.name, photo_url: form.photo_url || null, email: form.email || null,
      phone: form.phone || null, organization: form.organization || null,
      specialization: form.specialization || null, country: form.country || null,
      bio: form.bio || null, status: form.status, created_by: user?.id,
      linkedin: form.linkedin || null, preferred_client_type: form.preferred_client_type || null,
      experience: form.experience || null, availability: form.availability || null,
      preferred_communication: form.preferred_communication || null,
    };

    if (editing) {
      await supabase.from('coaches').update(payload).eq('id', editing);
      await logActivity('Updated coach', 'coach', editing, { name: form.name });
    } else {
      const { data: inserted } = await supabase.from('coaches').insert(payload).select('id').single();
      await logActivity('Created coach', 'coach', inserted?.id, { name: form.name });
    }
    setSaving(false); setShowForm(false); setEditing(null); setForm(emptyForm); fetchData();
  };

  const handleEdit = (coach: any) => {
    setForm({
      name: coach.name || '', photo_url: coach.photo_url || '', email: coach.email || '',
      phone: coach.phone || '', organization: coach.organization || '',
      specialization: coach.specialization || '', country: coach.country || '',
      bio: coach.bio || '', status: coach.status || 'Accepted',
      linkedin: coach.linkedin || '', preferred_client_type: coach.preferred_client_type || '',
      experience: coach.experience || '', availability: coach.availability || '',
      preferred_communication: coach.preferred_communication || '',
    });
    setEditing(coach.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const coach = coaches.find(c => c.id === id);
    await supabase.from('coaches').delete().eq('id', id);
    await logActivity('Deleted coach', 'coach', id, { name: coach?.name });
    fetchData();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold">Coaches ({total})</h2>
        <Button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Coach
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search coaches..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Coach / Mentor</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name *" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" type="email" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <input value={form.linkedin} onChange={e => setForm({...form, linkedin: e.target.value})} placeholder="LinkedIn Profile URL" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <input value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} placeholder="Organization" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <input value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="Specialization / Areas of Interest" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <input value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} placeholder="Photo URL" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="">Location / Country</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.preferred_communication} onChange={e => setForm({...form, preferred_communication: e.target.value})} className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="">Preferred Communication</option>
                {communicationOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Matched">Matched</option>
                <option value="Unmatched">Unmatched</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input value={form.preferred_client_type} onChange={e => setForm({...form, preferred_client_type: e.target.value})} placeholder="Preferred Client Type" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <input value={form.availability} onChange={e => setForm({...form, availability: e.target.value})} placeholder="Availability & Preferred Times" className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
            </div>
            <textarea value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="Relevant Experience" className="w-full mt-3 px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Bio" className="w-full mt-3 px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
            <Button onClick={handleSave} disabled={saving || !form.name} className="w-full mt-4 bg-primary text-primary-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? 'Update' : 'Create'} Coach
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Organization</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Specialization</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coaches.map(coach => (
                  <tr key={coach.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{coach.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{coach.organization || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{coach.specialization || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        coach.status === 'Accepted' ? 'bg-accent/10 text-accent' :
                        coach.status === 'Matched' ? 'bg-primary/10 text-primary' :
                        coach.status === 'Unmatched' ? 'bg-grow-gold/10 text-grow-gold' :
                        coach.status === 'Pending' ? 'bg-muted text-muted-foreground' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {coach.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(coach)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(coach.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coaches.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No coaches found.</td></tr>
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
