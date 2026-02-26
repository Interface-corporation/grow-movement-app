import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Loader2, X, Users, UserPlus, FolderKanban, Handshake } from 'lucide-react';
import { toast } from 'sonner';
import { logActivity } from '@/lib/activityLog';
import { Link } from 'react-router-dom';

export default function AdminPrograms() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'Active' });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<Record<string, { entrepreneurs: number; coaches: number; matches: number; projects: number }>>({});

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
    setPrograms(data || []);

    // Fetch stats per program
    if (data && data.length > 0) {
      const statsMap: any = {};
      for (const p of data) {
        const [ents, coaches, matches, projects] = await Promise.all([
          supabase.from('entrepreneurs').select('id', { count: 'exact', head: true }).eq('program_id', p.id),
          supabase.from('program_coaches').select('id', { count: 'exact', head: true }).eq('program_id', p.id),
          supabase.from('matches').select('id', { count: 'exact', head: true }).eq('program_id', p.id),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('program_id', p.id),
        ]);
        statsMap[p.id] = {
          entrepreneurs: ents.count ?? 0,
          coaches: coaches.count ?? 0,
          matches: matches.count ?? 0,
          projects: projects.count ?? 0,
        };
      }
      setStats(statsMap);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from('programs').update({ name: form.name, description: form.description || null, status: form.status }).eq('id', editing);
      await logActivity('Updated program', 'program', editing, { name: form.name });
      toast.success('Program updated');
    } else {
      const { data } = await supabase.from('programs').insert({ name: form.name, description: form.description || null, status: form.status, created_by: user?.id }).select('id').single();
      await logActivity('Created program', 'program', data?.id, { name: form.name });
      toast.success('Program created');
    }
    setSaving(false); setShowForm(false); setEditing(null); setForm({ name: '', description: '', status: 'Active' }); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program? All associations will be removed.')) return;
    const prog = programs.find(p => p.id === id);
    await supabase.from('programs').delete().eq('id', id);
    await logActivity('Deleted program', 'program', id, { name: prog?.name });
    toast.success('Program deleted');
    fetchData();
  };

  const filtered = programs.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold">Programs ({programs.length})</h2>
        <Button onClick={() => { setForm({ name: '', description: '', status: 'Active' }); setEditing(null); setShowForm(true); }} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> New Program
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Create'} Program</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Program Name *"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
              <Button onClick={handleSave} disabled={saving || !form.name} className="w-full bg-primary text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(prog => {
            const s = stats[prog.id] || { entrepreneurs: 0, coaches: 0, matches: 0, projects: 0 };
            return (
              <div key={prog.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Link to={`/admin/programs/${prog.id}`} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                      {prog.name}
                    </Link>
                    {prog.description && <p className="text-sm text-muted-foreground mt-1">{prog.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      prog.status === 'Active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                    }`}>{prog.status}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm({ name: prog.name, description: prog.description || '', status: prog.status }); setEditing(prog.id); setShowForm(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(prog.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: UserPlus, label: 'Entrepreneurs', val: s.entrepreneurs },
                    { icon: Users, label: 'Coaches', val: s.coaches },
                    { icon: Handshake, label: 'Matches', val: s.matches },
                    { icon: FolderKanban, label: 'Projects', val: s.projects },
                  ].map(item => (
                    <div key={item.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                      <item.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{item.val}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">No programs found.</div>
          )}
        </div>
      )}
    </div>
  );
}
