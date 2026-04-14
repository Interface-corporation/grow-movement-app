import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, UserPlus, FolderKanban, Handshake, Loader2, Plus, Search, X, Pencil, Trash2, MessageSquare, ChevronDown, ChevronUp, Send, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { logActivity } from '@/lib/activityLog';
import { useAutoSave } from '@/hooks/useAutoSave';

const emptyProjectForm = { name: '', description: '', status: 'Active', entrepreneur_id: '', coach_id: '' };

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
  const [activeSection, setActiveSection] = useState<'projects' | 'matches'>('projects');

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [saving, setSaving] = useState(false);

  const { clearAutoSave } = useAutoSave('program_project_form', projectForm, setProjectForm, showProjectForm);

  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Sessions state (same as AdminProjects)
  const [sessions, setSessions] = useState<any[]>([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState({ session_name: '', session_description: '', outcome: '' });
  const [savingSession, setSavingSession] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionComments, setSessionComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const canCreate = userRole === 'admin' || userRole === 'program_admin';

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

  // Sessions functions
  const fetchSessions = async (projectId: string) => {
    const { data } = await (supabase as any)
      .from('project_sessions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    const sessionsData = data || [];
    const authorIds = [...new Set(sessionsData.map((s: any) => s.created_by).filter(Boolean))] as string[];
    if (authorIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('user_id, full_name').in('user_id', authorIds);
      const map: Record<string, string> = {};
      (profs || []).forEach(p => { map[p.user_id] = p.full_name || 'Unknown'; });
      setProfiles(prev => ({ ...prev, ...map }));
    }
    setSessions(sessionsData);
  };

  const fetchComments = async (sessionId: string) => {
    const { data } = await (supabase as any)
      .from('session_comments')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const comments = data || [];
    const authorIds = [...new Set(comments.map((c: any) => c.author_id).filter(Boolean))] as string[];
    if (authorIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('user_id, full_name').in('user_id', authorIds);
      const map: Record<string, string> = {};
      (profs || []).forEach(p => { map[p.user_id] = p.full_name || 'Unknown'; });
      setProfiles(prev => ({ ...prev, ...map }));
    }
    setSessionComments(prev => ({ ...prev, [sessionId]: comments }));
  };

  const handleSaveSession = async () => {
    if (!sessionForm.session_name.trim() || !selectedProject) return;
    setSavingSession(true);
    if (editingSession) {
      const { error } = await (supabase as any).from('project_sessions').update({
        session_name: sessionForm.session_name.trim(),
        session_description: sessionForm.session_description.trim() || null,
        outcome: sessionForm.outcome.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', editingSession);
      if (error) toast.error('Failed to update session');
      else toast.success('Session updated');
    } else {
      const { error } = await (supabase as any).from('project_sessions').insert({
        project_id: selectedProject.id,
        session_name: sessionForm.session_name.trim(),
        session_description: sessionForm.session_description.trim() || null,
        outcome: sessionForm.outcome.trim() || null,
        created_by: user?.id,
      });
      if (error) toast.error('Failed to create session: ' + error.message);
      else toast.success('Session created');
    }
    setSessionForm({ session_name: '', session_description: '', outcome: '' });
    setShowSessionForm(false);
    setEditingSession(null);
    setSavingSession(false);
    await fetchSessions(selectedProject.id);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session and all its comments?')) return;
    await (supabase as any).from('project_sessions').delete().eq('id', sessionId);
    toast.success('Session deleted');
    if (selectedProject) await fetchSessions(selectedProject.id);
  };

  const handleAddComment = async (sessionId: string) => {
    if (!newComment.trim()) return;
    setAddingComment(true);
    const { error } = await (supabase as any).from('session_comments').insert({
      session_id: sessionId,
      author_id: user?.id,
      comment: newComment.trim(),
    });
    if (error) toast.error('Failed to add comment');
    else toast.success('Comment added');
    setNewComment('');
    setAddingComment(false);
    await fetchComments(sessionId);
  };

  const handleOpenProject = async (project: any) => {
    setSelectedProject(project);
    setExpandedSession(null);
    await fetchSessions(project.id);
  };

  // Match status controls
  const handleEndCoaching = async (match: any) => {
    if (!confirm('End coaching? The entrepreneur will become Alumni and the coach will be Unmatched.')) return;
    await Promise.all([
      supabase.from('matches').update({ status: 'completed' }).eq('id', match.id),
      supabase.from('entrepreneurs').update({ status: 'Alumni' }).eq('id', match.entrepreneur_id),
      supabase.from('coaches').update({ status: 'Unmatched' }).eq('id', match.coach_id),
    ]);
    await logActivity('Completed match', 'match', match.id);
    toast.success('Coaching session ended.');
    fetchData();
  };

  const handleUnmatch = async (match: any) => {
    if (!confirm('Unmatch? The entrepreneur will return to Admitted and the coach to Unmatched.')) return;
    await Promise.all([
      supabase.from('matches').update({ status: 'cancelled' }).eq('id', match.id),
      supabase.from('entrepreneurs').update({ status: 'Admitted' }).eq('id', match.entrepreneur_id),
      supabase.from('coaches').update({ status: 'Unmatched' }).eq('id', match.coach_id),
    ]);
    await logActivity('Unmatched', 'match', match.id);
    toast.success('Match cancelled.');
    fetchData();
  };

  const handleSaveProject = async () => {
    setSaving(true);
    const payload: any = {
      name: projectForm.name, description: projectForm.description || null, status: projectForm.status,
      program_id: id, entrepreneur_id: projectForm.entrepreneur_id || null, coach_id: projectForm.coach_id || null,
      created_by: user?.id,
    };

    if (projectForm.entrepreneur_id && projectForm.coach_id && !editingProject) {
      const { data: match } = await supabase.from('matches').insert({
        entrepreneur_id: projectForm.entrepreneur_id, coach_id: projectForm.coach_id,
        program_id: id, created_by: user?.id, status: 'Active',
      }).select('id').single();
      if (match) {
        payload.match_id = match.id;
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
    clearAutoSave();
    setSaving(false); setShowProjectForm(false); setEditingProject(null);
    setProjectForm(emptyProjectForm);
    fetchData();
  };

  const handleDeleteProject = async (projId: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', projId);
    toast.success('Project deleted');
    fetchData();
  };

  const handleClearProjectForm = () => {
    setProjectForm(emptyProjectForm);
    clearAutoSave();
    toast.info('Form cleared');
  };

  const getEntName = (entId: string | null) => entrepreneurs.find(e => e.id === entId)?.name || '—';
  const getCoachName = (cId: string | null) => coaches.find(c => c.id === cId)?.name || '—';

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

      {/* Section Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button onClick={() => setActiveSection('projects')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSection === 'projects' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Projects ({projects.length})
        </button>
        <button onClick={() => setActiveSection('matches')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSection === 'matches' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Matches ({matches.length})
        </button>
      </div>

      {activeSection === 'projects' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h3 className="text-lg font-bold">Projects</h3>
            {canCreate && (
              <Button size="sm" onClick={() => { setProjectForm(emptyProjectForm); setEditingProject(null); setShowProjectForm(true); }}>
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
                      {canCreate && (
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
        </>
      )}

      {/* Matches Section */}
      {activeSection === 'matches' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Matches</h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Entrepreneur</th>
                  <th className="text-left px-4 py-3 font-medium">Coach</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matches.map(m => (
                  <tr key={m.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{getEntName(m.entrepreneur_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getCoachName(m.coach_id)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        m.status === 'active' || m.status === 'Active' ? 'bg-accent/10 text-accent' :
                        m.status === 'completed' ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>{m.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {(m.status === 'active' || m.status === 'Active') && canCreate && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => handleEndCoaching(m)}>End Coaching</Button>
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => handleUnmatch(m)}>Unmatch</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {matches.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No matches found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowProjectForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingProject ? 'Edit' : 'New'} Project</h3>
              <button onClick={() => setShowProjectForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Project Name *</label>
                <input value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="Project Name"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Description"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Entrepreneur</label>
                <select value={projectForm.entrepreneur_id} onChange={e => setProjectForm({ ...projectForm, entrepreneur_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Assign Entrepreneur</option>
                  {entrepreneurs.filter(e => e.status === 'Admitted').map(e => <option key={e.id} value={e.id}>{e.name} — {e.business_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Coach</label>
                <select value={projectForm.coach_id} onChange={e => setProjectForm({ ...projectForm, coach_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Assign Coach</option>
                  {coaches.filter(c => ['Accepted', 'Unmatched'].includes(c.status)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Status</label>
                <select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProject} disabled={saving || !projectForm.name} className="flex-1 bg-primary text-primary-foreground">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
                <Button variant="outline" onClick={handleClearProjectForm} type="button" title="Clear form">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal with Sessions */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => { setSelectedProject(null); setExpandedSession(null); }}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{selectedProject.name}</h3>
              <button onClick={() => { setSelectedProject(null); setExpandedSession(null); }}><X className="h-5 w-5" /></button>
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

              {/* Sessions */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Sessions ({sessions.length})
                  </h4>
                  {canCreate && (
                    <Button size="sm" variant="outline" onClick={() => { setSessionForm({ session_name: '', session_description: '', outcome: '' }); setEditingSession(null); setShowSessionForm(true); }}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> New Session
                    </Button>
                  )}
                </div>

                {/* Session Form */}
                {showSessionForm && (
                  <div className="bg-secondary/30 rounded-xl p-4 mb-4 space-y-3">
                    <h5 className="text-sm font-semibold">{editingSession ? 'Edit' : 'New'} Session</h5>
                    <div>
                      <label className="block text-xs font-medium mb-1">Session Name *</label>
                      <input value={sessionForm.session_name} onChange={e => setSessionForm({ ...sessionForm, session_name: e.target.value })}
                        placeholder="e.g. Week 1 - Business Model Review"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Description</label>
                      <textarea value={sessionForm.session_description} onChange={e => setSessionForm({ ...sessionForm, session_description: e.target.value })}
                        placeholder="What was discussed or planned..."
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Outcome</label>
                      <textarea value={sessionForm.outcome} onChange={e => setSessionForm({ ...sessionForm, outcome: e.target.value })}
                        placeholder="Key outcomes or decisions..."
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={2} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveSession} disabled={savingSession || !sessionForm.session_name.trim()}>
                        {savingSession ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                        {editingSession ? 'Update' : 'Create'} Session
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setShowSessionForm(false); setEditingSession(null); }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Sessions List */}
                <div className="space-y-3">
                  {sessions.map((session, idx) => (
                    <div key={session.id} className="border border-border rounded-xl overflow-hidden">
                      <div
                        className="flex items-center justify-between p-3 bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors"
                        onClick={() => {
                          const newExpanded = expandedSession === session.id ? null : session.id;
                          setExpandedSession(newExpanded);
                          if (newExpanded) fetchComments(session.id);
                        }}>
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                          <div>
                            <p className="text-sm font-semibold">{session.session_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString()}
                              {session.created_by && profiles[session.created_by] ? ` • by ${profiles[session.created_by]}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {canCreate && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
                                e.stopPropagation();
                                setSessionForm({ session_name: session.session_name, session_description: session.session_description || '', outcome: session.outcome || '' });
                                setEditingSession(session.id);
                                setShowSessionForm(true);
                              }}><Pencil className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {expandedSession === session.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {expandedSession === session.id && (
                        <div className="p-4 space-y-3">
                          {session.session_description && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Description</span>
                              <p className="text-sm mt-1 whitespace-pre-line">{session.session_description}</p>
                            </div>
                          )}
                          {session.outcome && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Outcome</span>
                              <p className="text-sm mt-1 whitespace-pre-line">{session.outcome}</p>
                            </div>
                          )}
                          {session.updated_at !== session.created_at && (
                            <p className="text-xs text-muted-foreground">Last updated: {new Date(session.updated_at).toLocaleString()}</p>
                          )}

                          {/* Comments */}
                          <div className="border-t border-border pt-3">
                            <h6 className="text-xs font-semibold text-muted-foreground mb-2">
                              Comments ({(sessionComments[session.id] || []).length})
                            </h6>
                            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                              {(sessionComments[session.id] || []).map(comment => (
                                <div key={comment.id} className="bg-secondary/30 rounded-lg p-2.5 text-sm">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium text-xs">{comment.author_id ? (profiles[comment.author_id] || 'Unknown') : 'System'}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                                  </div>
                                  <p className="text-muted-foreground text-xs">{comment.comment}</p>
                                </div>
                              ))}
                              {(sessionComments[session.id] || []).length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">No comments yet.</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input value={expandedSession === session.id ? newComment : ''} onChange={e => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(session.id); }} />
                              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={addingComment || !newComment.trim()}
                                onClick={() => handleAddComment(session.id)}>
                                {addingComment ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {sessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No sessions yet. Create one to start tracking progress.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
