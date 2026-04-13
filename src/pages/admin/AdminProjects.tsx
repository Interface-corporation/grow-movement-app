import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Plus, X, Pencil, Trash2, MessageSquare, FolderKanban, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { toast } from 'sonner';
import { logActivity } from '@/lib/activityLog';
import { useAutoSave } from '@/hooks/useAutoSave';

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

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'Active', program_id: '', entrepreneur_id: '', coach_id: '' });
  const [saving, setSaving] = useState(false);

  const { clearAutoSave } = useAutoSave('project_form', form, setForm, showForm);

  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Sessions state
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

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('projects').select('*', { count: 'exact' });

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

  const fetchSessions = async (projectId: string) => {
    const { data } = await supabase
      .from('project_sessions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    const sessionsData = data || [];
    
    // Fetch author names
    const authorIds = [...new Set(sessionsData.map(s => s.created_by).filter(Boolean))];
    if (authorIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('user_id, full_name').in('user_id', authorIds);
      const map: Record<string, string> = {};
      (profs || []).forEach(p => { map[p.user_id] = p.full_name || 'Unknown'; });
      setProfiles(prev => ({ ...prev, ...map }));
    }

    setSessions(sessionsData);
  };

  const fetchComments = async (sessionId: string) => {
    const { data } = await supabase
      .from('session_comments')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const comments = data || [];
    const authorIds = [...new Set(comments.map(c => c.author_id).filter(Boolean))];
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
      // Auto-create match when both entrepreneur and coach are selected
      if (form.entrepreneur_id && form.coach_id) {
        const { data: match } = await supabase.from('matches').insert({
          entrepreneur_id: form.entrepreneur_id, coach_id: form.coach_id,
          program_id: form.program_id || null, created_by: user?.id, status: 'active',
        }).select('id').single();
        if (match) payload.match_id = match.id;
        await supabase.from('entrepreneurs').update({ status: 'Matched' }).eq('id', form.entrepreneur_id);
        await supabase.from('coaches').update({ status: 'Matched' }).eq('id', form.coach_id);
      }
      const { data } = await supabase.from('projects').insert(payload).select('id').single();
      await logActivity('Created project', 'project', data?.id, { name: form.name });
      toast.success('Project created' + (form.entrepreneur_id && form.coach_id ? ' with auto-generated match' : ''));
    }
    clearAutoSave();
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
                  <tr key={p.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => { setSelectedProject(p); fetchSessions(p.id); }}>
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
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Project Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project Name"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
              </div>
              {(userRole === 'admin' || userRole === 'program_admin') && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Program</label>
                  <select value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option value="">Private (No Program)</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Entrepreneur</label>
                <select value={form.entrepreneur_id} onChange={e => setForm({ ...form, entrepreneur_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Select Entrepreneur</option>
                  {entrepreneurs.map(e => <option key={e.id} value={e.id}>{e.name} — {e.business_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Coach</label>
                <select value={form.coach_id} onChange={e => setForm({ ...form, coach_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Select Coach</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {!editing && form.entrepreneur_id && form.coach_id && (
                <p className="text-xs text-accent bg-accent/5 rounded-lg p-2">
                  ✨ A match will be automatically created for this entrepreneur and coach.
                </p>
              )}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <Button onClick={handleSave} disabled={saving || !form.name} className="w-full bg-primary text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? 'Update' : 'Create'} Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal with Sessions */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => { setSelectedProject(null); setExpandedSession(null); }}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{selectedProject.name}</h3>
              <button onClick={() => { setSelectedProject(null); setExpandedSession(null); }}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-secondary/50 rounded-xl p-3"><span className="text-muted-foreground">Program</span><p className="font-medium">{getProgramName(selectedProject.program_id)}</p></div>
              <div className="bg-secondary/50 rounded-xl p-3"><span className="text-muted-foreground">Status</span><p className="font-medium">{selectedProject.status}</p></div>
              <div className="bg-secondary/50 rounded-xl p-3"><span className="text-muted-foreground">Entrepreneur</span><p className="font-medium">{getEntName(selectedProject.entrepreneur_id)}</p></div>
              <div className="bg-secondary/50 rounded-xl p-3"><span className="text-muted-foreground">Coach</span><p className="font-medium">{getCoachName(selectedProject.coach_id)}</p></div>
            </div>
            {selectedProject.description && <p className="text-sm text-muted-foreground mb-4">{selectedProject.description}</p>}

            {/* Sessions Section */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Sessions ({sessions.length})</h4>
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
                {sessions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No sessions yet. Create one to start tracking progress.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
