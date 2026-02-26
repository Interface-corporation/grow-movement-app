import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Plus, X, Pencil, Trash2, MessageSquare, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { logActivity } from '@/lib/activityLog';

export default function AdminProjects() {
  const { user, userRole, programId, coachId } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'Active', program_id: '', entrepreneur_id: '', coach_id: '' });
  const [saving, setSaving] = useState(false);

  // Detail modal
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [trackNotes, setTrackNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('projects').select('*', { count: 'exact' });

    // Role-based filtering
    if (userRole === 'program_admin' && programId) {
      query = query.eq('program_id', programId);
    } else if (userRole === 'coach' && coachId) {
      query = query.eq('coach_id', coachId);
    }

    if (search) query = query.ilike('name', `%${search}%`);
    if (statusFilter) query = query.eq('status', statusFilter);
    if (programFilter) query = query.eq('program_id', programFilter);

    const { data, count } = await query.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setProjects(data || []);
    setTotal(count ?? 0);

    // Fetch programs, entrepreneurs, coaches for dropdowns
    const [progsRes, entsRes, coachesRes] = await Promise.all([
      supabase.from('programs').select('id, name'),
      supabase.from('entrepreneurs').select('id, name, business_name'),
      supabase.from('coaches').select('id, name'),
    ]);
    setPrograms(progsRes.data || []);
    setEntrepreneurs(entsRes.data || []);
    setCoaches(coachesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter, programFilter]);

  const fetchNotes = async (projectId: string) => {
    const { data } = await supabase
      .from('project_track_notes')
      .select('*, profiles:author_id(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    setTrackNotes(data || []);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedProject) return;
    setAddingNote(true);
    await supabase.from('project_track_notes').insert({ project_id: selectedProject.id, author_id: user?.id, note: newNote.trim() });
    setNewNote('');
    await fetchNotes(selectedProject.id);
    setAddingNote(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      name: form.name, description: form.description || null, status: form.status,
      program_id: form.program_id || null, entrepreneur_id: form.entrepreneur_id || null,
      coach_id: form.coach_id || null, created_by: user?.id,
    };

    if (editing) {
      await supabase.from('projects').update(payload).eq('id', editing);
      await logActivity('Updated project', 'project', editing, { name: form.name });
      toast.success('Project updated');
    } else {
      // Auto-create match
      if (form.entrepreneur_id && form.coach_id) {
        const { data: match } = await supabase.from('matches').insert({
          entrepreneur_id: form.entrepreneur_id, coach_id: form.coach_id,
          program_id: form.program_id || null, created_by: user?.id, status: 'Active',
        }).select('id').single();
        if (match) payload.match_id = match.id;
        await supabase.from('entrepreneurs').update({ status: 'Matched' }).eq('id', form.entrepreneur_id);
        await supabase.from('coaches').update({ status: 'Matched' }).eq('id', form.coach_id);
      }
      const { data } = await supabase.from('projects').insert(payload).select('id').single();
      await logActivity('Created project', 'project', data?.id, { name: form.name });
      toast.success('Project created');
    }
    setSaving(false); setShowForm(false); setEditing(null);
    setForm({ name: '', description: '', status: 'Active', program_id: '', entrepreneur_id: '', coach_id: '' });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    toast.success('Project deleted');
    fetchData();
  };

  const getEntName = (id: string | null) => entrepreneurs.find(e => e.id === id)?.name || '—';
  const getCoachName = (id: string | null) => coaches.find(c => c.id === id)?.name || '—';
  const getProgramName = (id: string | null) => programs.find(p => p.id === id)?.name || 'Private';
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const canCreate = userRole === 'admin' || userRole === 'program_admin';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2"><FolderKanban className="h-5 w-5 text-primary" /> Projects ({total})</h2>
        {canCreate && (
          <Button onClick={() => { setForm({ name: '', description: '', status: 'Active', program_id: '', entrepreneur_id: '', coach_id: '' }); setEditing(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
        {userRole === 'admin' && (
          <select value={programFilter} onChange={e => { setProgramFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
            <option value="">All Programs</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Project</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Program</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Entrepreneur</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Coach</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map(p => (
                  <tr key={p.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => { setSelectedProject(p); fetchNotes(p.id); }}>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{getProgramName(p.program_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{getEntName(p.entrepreneur_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{getCoachName(p.coach_id)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-accent/10 text-accent' : p.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {canCreate && (
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                            setForm({ name: p.name, description: p.description || '', status: p.status, program_id: p.program_id || '', entrepreneur_id: p.entrepreneur_id || '', coach_id: p.coach_id || '' });
                            setEditing(p.id); setShowForm(true);
                          }}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No projects found.</td></tr>
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

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'New'} Project</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project Name *"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
              {userRole === 'admin' && (
                <select value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Private (No Program)</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              <select value={form.entrepreneur_id} onChange={e => setForm({ ...form, entrepreneur_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="">Assign Entrepreneur</option>
                {entrepreneurs.map(e => <option key={e.id} value={e.id}>{e.name} — {e.business_name}</option>)}
              </select>
              <select value={form.coach_id} onChange={e => setForm({ ...form, coach_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="">Assign Coach</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
              <Button onClick={handleSave} disabled={saving || !form.name} className="w-full bg-primary text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? 'Update' : 'Create'} Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{selectedProject.name}</h3>
              <button onClick={() => setSelectedProject(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-secondary/50 rounded-xl p-3"><span className="text-muted-foreground">Program</span><p className="font-medium">{getProgramName(selectedProject.program_id)}</p></div>
              <div className="bg-secondary/50 rounded-xl p-3"><span className="text-muted-foreground">Status</span><p className="font-medium">{selectedProject.status}</p></div>
              <div className="bg-secondary/50 rounded-xl p-3"><span className="text-muted-foreground">Entrepreneur</span><p className="font-medium">{getEntName(selectedProject.entrepreneur_id)}</p></div>
              <div className="bg-secondary/50 rounded-xl p-3"><span className="text-muted-foreground">Coach</span><p className="font-medium">{getCoachName(selectedProject.coach_id)}</p></div>
            </div>
            {selectedProject.description && <p className="text-sm text-muted-foreground mb-4">{selectedProject.description}</p>}

            <h4 className="font-bold flex items-center gap-2 mb-3"><MessageSquare className="h-4 w-4" /> Track Notes</h4>
            <div className="flex gap-2 mb-3">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..."
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
              <Button size="sm" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>Add</Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {trackNotes.map(note => (
                <div key={note.id} className="bg-secondary/30 rounded-xl p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{(note as any).profiles?.full_name || 'System'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground">{note.note}</p>
                </div>
              ))}
              {trackNotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
