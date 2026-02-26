import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, UserPlus, FolderKanban, Handshake, Loader2, Plus, Search, X, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { logActivity } from '@/lib/activityLog';

export default function AdminProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, userRole } = useAuth();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', status: 'Active', entrepreneur_id: '', coach_id: '' });
  const [saving, setSaving] = useState(false);

  // Project detail modal
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [trackNotes, setTrackNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [progRes, projRes, entRes, coachRes, matchRes] = await Promise.all([
      supabase.from('programs').select('*').eq('id', id!).single(),
      supabase.from('projects').select('*').eq('program_id', id!).order('created_at', { ascending: false }),
      supabase.from('entrepreneurs').select('id, name, business_name, status').eq('program_id', id!),
      supabase.from('program_coaches').select('coach_id, coaches(id, name, organization, status)').eq('program_id', id!),
      supabase.from('matches').select('*').eq('program_id', id!),
    ]);
    setProgram(progRes.data);
    setProjects(projRes.data || []);
    setEntrepreneurs(entRes.data || []);
    setCoaches((coachRes.data || []).map((pc: any) => pc.coaches));
    setMatches(matchRes.data || []);
    setLoading(false);
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchNotes = async (projectId: string) => {
    const { data } = await supabase
      .from('project_track_notes')
      .select('*, profiles:author_id(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    setTrackNotes(data || []);
  };

  const handleOpenProject = async (project: any) => {
    setSelectedProject(project);
    await fetchNotes(project.id);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedProject) return;
    setAddingNote(true);
    await supabase.from('project_track_notes').insert({ project_id: selectedProject.id, author_id: user?.id, note: newNote.trim() });
    setNewNote('');
    await fetchNotes(selectedProject.id);
    setAddingNote(false);
  };

  const handleSaveProject = async () => {
    setSaving(true);
    const payload: any = {
      name: projectForm.name, description: projectForm.description || null, status: projectForm.status,
      program_id: id, entrepreneur_id: projectForm.entrepreneur_id || null, coach_id: projectForm.coach_id || null,
      created_by: user?.id,
    };

    // Auto-create match if both entrepreneur and coach are assigned
    if (projectForm.entrepreneur_id && projectForm.coach_id && !editingProject) {
      const { data: match } = await supabase.from('matches').insert({
        entrepreneur_id: projectForm.entrepreneur_id, coach_id: projectForm.coach_id,
        program_id: id, created_by: user?.id, status: 'Active',
      }).select('id').single();
      if (match) {
        payload.match_id = match.id;
        // Update statuses
        await supabase.from('entrepreneurs').update({ status: 'Matched' }).eq('id', projectForm.entrepreneur_id);
        await supabase.from('coaches').update({ status: 'Matched' }).eq('id', projectForm.coach_id);
      }
    }

    if (editingProject) {
      await supabase.from('projects').update(payload).eq('id', editingProject);
      await logActivity('Updated project', 'project', editingProject, { name: projectForm.name });
      toast.success('Project updated');
    } else {
      const { data } = await supabase.from('projects').insert(payload).select('id').single();
      await logActivity('Created project', 'project', data?.id, { name: projectForm.name });
      toast.success('Project created');
    }
    setSaving(false); setShowProjectForm(false); setEditingProject(null);
    setProjectForm({ name: '', description: '', status: 'Active', entrepreneur_id: '', coach_id: '' });
    fetchData();
  };

  const handleDeleteProject = async (projId: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', projId);
    toast.success('Project deleted');
    fetchData();
  };

  const getEntName = (entId: string | null) => entrepreneurs.find(e => e.id === entId)?.name || '—';
  const getCoachName = (coachId: string | null) => coaches.find(c => c.id === coachId)?.name || '—';

  const filteredProjects = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!program) return <div className="text-center py-10 text-muted-foreground">Program not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/programs"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h2 className="text-xl font-bold">{program.name}</h2>
          {program.description && <p className="text-sm text-muted-foreground">{program.description}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: UserPlus, label: 'Entrepreneurs', val: entrepreneurs.length, color: 'text-primary' },
          { icon: Users, label: 'Coaches', val: coaches.length, color: 'text-accent' },
          { icon: Handshake, label: 'Matches', val: matches.length, color: 'text-primary' },
          { icon: FolderKanban, label: 'Projects', val: projects.length, color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
            <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
            <p className="text-2xl font-bold text-foreground">{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Projects Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h3 className="text-lg font-bold">Projects</h3>
        {(userRole === 'admin' || userRole === 'program_admin') && (
          <Button size="sm" onClick={() => { setProjectForm({ name: '', description: '', status: 'Active', entrepreneur_id: '', coach_id: '' }); setEditingProject(null); setShowProjectForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New Project
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Projects List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Project</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Entrepreneur</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Coach</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProjects.map(p => (
              <tr key={p.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => handleOpenProject(p)}>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{getEntName(p.entrepreneur_id)}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{getCoachName(p.coach_id)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-accent/10 text-accent' : p.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                  {(userRole === 'admin' || userRole === 'program_admin') && (
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setProjectForm({ name: p.name, description: p.description || '', status: p.status, entrepreneur_id: p.entrepreneur_id || '', coach_id: p.coach_id || '' });
                        setEditingProject(p.id); setShowProjectForm(true);
                      }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteProject(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No projects found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowProjectForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingProject ? 'Edit' : 'New'} Project</h3>
              <button onClick={() => setShowProjectForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="Project Name *"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Description"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
              <select value={projectForm.entrepreneur_id} onChange={e => setProjectForm({ ...projectForm, entrepreneur_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="">Assign Entrepreneur</option>
                {entrepreneurs.filter(e => e.status === 'Admitted').map(e => <option key={e.id} value={e.id}>{e.name} — {e.business_name}</option>)}
              </select>
              <select value={projectForm.coach_id} onChange={e => setProjectForm({ ...projectForm, coach_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="">Assign Coach</option>
                {coaches.filter(c => ['Accepted', 'Unmatched'].includes(c.status)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
              <Button onClick={handleSaveProject} disabled={saving || !projectForm.name} className="w-full bg-primary text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingProject ? 'Update' : 'Create'} Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal with Track Notes */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{selectedProject.name}</h3>
              <button onClick={() => setSelectedProject(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary/50 rounded-xl p-3">
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium">{selectedProject.status}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-medium">{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <span className="text-muted-foreground">Entrepreneur</span>
                  <p className="font-medium">{getEntName(selectedProject.entrepreneur_id)}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <span className="text-muted-foreground">Coach</span>
                  <p className="font-medium">{getCoachName(selectedProject.coach_id)}</p>
                </div>
              </div>
              {selectedProject.description && (
                <div className="bg-secondary/50 rounded-xl p-3 text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <p className="mt-1">{selectedProject.description}</p>
                </div>
              )}

              {/* Track Notes */}
              <div>
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4" /> Track Notes ({trackNotes.length})
                </h4>
                <div className="flex gap-2 mb-3">
                  <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a track note..."
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
                  <Button size="sm" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                    {addingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {trackNotes.map(note => (
                    <div key={note.id} className="bg-secondary/30 rounded-xl p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{(note as any).profiles?.full_name || 'System'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground">{note.note}</p>
                    </div>
                  ))}
                  {trackNotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No track notes yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
