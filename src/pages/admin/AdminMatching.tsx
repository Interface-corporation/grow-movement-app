import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Loader2, X, Handshake, Search, Eye, FolderKanban, RotateCcw } from 'lucide-react';
import { logActivity } from '@/lib/activityLog';
import { toast } from 'sonner';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useNavigate } from 'react-router-dom';

type MatchStatusFilter = 'all' | 'active' | 'completed' | 'cancelled';
const PAGE_SIZE = 9;
const emptyForm = { entrepreneur_id: '', coach_id: '', notes: '', request_id: '', program_id: '' };

export default function AdminMatching() {
  const { user, userRole, coachId, programId } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [allEntrepreneurs, setAllEntrepreneurs] = useState<any[]>([]);
  const [allCoaches, setAllCoaches] = useState<any[]>([]);
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [page, setPage] = useState(0);

  const { clearAutoSave } = useAutoSave('match_form', form, setForm, showForm);

  const isReadOnly = userRole === 'coach';
  const canCreate = userRole === 'admin' || userRole === 'program_admin';

  const fetchData = async () => {
    setLoading(true);
    let matchQuery = supabase.from('matches').select('*').order('created_at', { ascending: false });

    if (userRole === 'coach' && coachId) {
      matchQuery = matchQuery.eq('coach_id', coachId);
    } else if (userRole === 'program_admin' && programId) {
      matchQuery = matchQuery.eq('program_id', programId);
    }

    const [matchRes, entRes, coachRes, allEntRes, allCoachRes, reqRes, progRes, projRes] = await Promise.all([
      matchQuery,
      supabase.from('entrepreneurs').select('id, name, business_name, status').eq('status', 'Admitted'),
      supabase.from('coaches').select('id, name, organization, status').in('status', ['Accepted', 'Unmatched']),
      supabase.from('entrepreneurs').select('*'),
      supabase.from('coaches').select('*'),
      supabase.from('matching_requests').select('id, requester_name, requester_email, status').in('status', ['pending', 'reviewed']),
      supabase.from('programs').select('id, name'),
      supabase.from('projects').select('id, name, match_id'),
    ]);
    setMatches(matchRes.data || []);
    setEntrepreneurs(entRes.data || []);
    setCoaches(coachRes.data || []);
    setAllEntrepreneurs(allEntRes.data || []);
    setAllCoaches(allCoachRes.data || []);
    setMatchingRequests(reqRes.data || []);
    setPrograms(progRes.data || []);
    setProjects(projRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const syncRequestStatus = async (match: any, newStatus: string) => {
    if (match.request_id) {
      const requestStatus = newStatus === 'completed' ? 'matched' : newStatus === 'cancelled' ? 'cancelled' : newStatus;
      await supabase.from('matching_requests').update({ status: requestStatus }).eq('id', match.request_id);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    const entData = entrepreneurs.find(e => e.id === form.entrepreneur_id);
    const coachData = coaches.find(c => c.id === form.coach_id);

    const { data: inserted, error } = await supabase.from('matches').insert({
      entrepreneur_id: form.entrepreneur_id, coach_id: form.coach_id,
      notes: form.notes || null, created_by: user?.id,
      request_id: form.request_id || null,
      program_id: form.program_id || null,
    }).select('id').single();
    if (error) { toast.error('Failed to create match: ' + error.message); setSaving(false); return; }
    
    await Promise.all([
      supabase.from('entrepreneurs').update({ status: 'Matched' }).eq('id', form.entrepreneur_id),
      supabase.from('coaches').update({ status: 'Matched' }).eq('id', form.coach_id),
      form.request_id ? supabase.from('matching_requests').update({ status: 'matched' }).eq('id', form.request_id) : Promise.resolve(),
    ]);

    if (inserted?.id) {
      const projectName = `${entData?.name || 'Entrepreneur'} × ${coachData?.name || 'Coach'}`;
      await supabase.from('projects').insert({
        name: projectName,
        entrepreneur_id: form.entrepreneur_id,
        coach_id: form.coach_id,
        program_id: form.program_id || null,
        match_id: inserted.id,
        status: 'Active',
        created_by: user?.id,
      });
    }

    await logActivity('Created match', 'match', inserted?.id, { entrepreneur: entData?.name, coach: coachData?.name });
    toast.success('Match and project created successfully!');
    clearAutoSave();
    setSaving(false); setShowForm(false); setForm(emptyForm); fetchData();
  };

  const handleEndCoaching = async (match: any) => {
    if (!confirm('End coaching? The entrepreneur will become Alumni and the coach will be Unmatched.')) return;
    const { error } = await supabase.from('matches').update({ status: 'completed' }).eq('id', match.id);
    if (error) { toast.error('Failed to end coaching: ' + error.message); return; }
    await Promise.all([
      supabase.from('entrepreneurs').update({ status: 'Alumni' }).eq('id', match.entrepreneur_id),
      supabase.from('coaches').update({ status: 'Unmatched' }).eq('id', match.coach_id),
    ]);
    await syncRequestStatus(match, 'completed');
    await logActivity('Completed match', 'match', match.id).catch(() => {});
    toast.success('Coaching session ended. Entrepreneur is now Alumni.');
    setSelectedMatch(null); fetchData();
  };

  const handleUnmatch = async (match: any) => {
    if (!confirm('Unmatch? The entrepreneur will return to Admitted and the coach to Unmatched.')) return;
    const { error } = await supabase.from('matches').update({ status: 'cancelled' }).eq('id', match.id);
    if (error) { toast.error('Failed to unmatch: ' + error.message); return; }
    await Promise.all([
      supabase.from('entrepreneurs').update({ status: 'Admitted' }).eq('id', match.entrepreneur_id),
      supabase.from('coaches').update({ status: 'Unmatched' }).eq('id', match.coach_id),
    ]);
    await syncRequestStatus(match, 'cancelled');
    await logActivity('Unmatched', 'match', match.id).catch(() => {});
    toast.success('Match cancelled. Both parties are now available.');
    setSelectedMatch(null); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this match record?')) return;
    await supabase.from('matches').delete().eq('id', id);
    await logActivity('Deleted match', 'match', id);
    toast.success('Match record deleted.');
    setSelectedMatch(null); fetchData();
  };

  const handleClearForm = () => {
    setForm(emptyForm);
    clearAutoSave();
    toast.info('Form cleared');
  };

  const getEnt = (id: string) => allEntrepreneurs.find(e => e.id === id);
  const getCoach = (id: string) => allCoaches.find(c => c.id === id);
  const getEntName = (id: string) => getEnt(id)?.name || 'Unknown';
  const getCoachName = (id: string) => getCoach(id)?.name || 'Unknown';
  const getRequestName = (id: string | null) => matchingRequests.find(r => r.id === id)?.requester_name || null;
  const getProgramName = (id: string | null) => programs.find(p => p.id === id)?.name || null;
  const getProjectForMatch = (matchId: string) => projects.find(p => p.match_id === matchId);

  const filteredMatches = matches.filter(m => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return getEntName(m.entrepreneur_id).toLowerCase().includes(q) ||
      getCoachName(m.coach_id).toLowerCase().includes(q) ||
      (m.notes || '').toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredMatches.length / PAGE_SIZE);
  const paginatedMatches = filteredMatches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statusCounts = {
    all: matches.length,
    active: matches.filter(m => m.status === 'active').length,
    completed: matches.filter(m => m.status === 'completed').length,
    cancelled: matches.filter(m => m.status === 'cancelled').length,
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Matches ({matches.length})</h2>
        {canCreate && (
          <Button onClick={() => { setForm(emptyForm); setShowForm(true); }} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Create Match
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by entrepreneur, coach, or notes..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'active', 'completed', 'cancelled'] as MatchStatusFilter[]).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Create Match Modal */}
      {showForm && canCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Create Match</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Program</label>
                <select value={form.program_id} onChange={e => setForm({...form, program_id: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">No Program</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {matchingRequests.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Link to Matching Request (optional)</label>
                  <select value={form.request_id} onChange={e => setForm({...form, request_id: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option value="">No linked request</option>
                    {matchingRequests.map(r => <option key={r.id} value={r.id}>{r.requester_name} — {r.requester_email} ({r.status})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Entrepreneur (Admitted only)</label>
                <select value={form.entrepreneur_id} onChange={e => setForm({...form, entrepreneur_id: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Select Entrepreneur *</option>
                  {entrepreneurs.map(e => <option key={e.id} value={e.id}>{e.name} — {e.business_name}</option>)}
                </select>
                {entrepreneurs.length === 0 && <p className="text-xs text-muted-foreground mt-1">No admitted entrepreneurs available.</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Coach (Accepted/Unmatched only)</label>
                <select value={form.coach_id} onChange={e => setForm({...form, coach_id: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Select Coach *</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.name}{c.organization ? ` — ${c.organization}` : ''}</option>)}
                </select>
                {coaches.length === 0 && <p className="text-xs text-muted-foreground mt-1">No available coaches.</p>}
              </div>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notes (optional)"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate} disabled={saving || !form.entrepreneur_id || !form.coach_id} className="flex-1 bg-primary text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Handshake className="h-4 w-4 mr-2" />}
                Create Match
              </Button>
              <Button variant="outline" onClick={handleClearForm} type="button" title="Clear form">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedMatch(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Handshake className="h-6 w-6 text-accent" />
                <h3 className="text-lg font-bold">Match Details</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  selectedMatch.status === 'active' ? 'bg-accent/10 text-accent' :
                  selectedMatch.status === 'completed' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>{selectedMatch.status}</span>
              </div>
              <button onClick={() => setSelectedMatch(null)}><X className="h-5 w-5" /></button>
            </div>

            {selectedMatch.program_id && (
              <div className="mb-4 text-xs bg-primary/5 rounded-xl p-3 flex items-center gap-2">
                <span className="text-muted-foreground">Program:</span>
                <span className="font-medium text-primary">{getProgramName(selectedMatch.program_id)}</span>
              </div>
            )}

            {selectedMatch.request_id && (
              <div className="mb-4 text-xs bg-secondary/50 rounded-xl p-3 flex items-center gap-2">
                <span className="text-muted-foreground">Linked Request:</span>
                <span className="font-medium">{getRequestName(selectedMatch.request_id) || selectedMatch.request_id}</span>
              </div>
            )}

            {/* Link to related project - NOW NAVIGATES PROPERLY */}
            {(() => {
              const project = getProjectForMatch(selectedMatch.id);
              if (project) return (
                <div className="mb-4 text-xs bg-accent/5 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">Related Project:</span>
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7"
                    onClick={() => {
                      setSelectedMatch(null);
                      navigate('/admin/projects', { state: { openProjectId: project.id } });
                    }}>
                    View Project →
                  </Button>
                </div>
              );
              return null;
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary/30 rounded-xl p-4">
                <h4 className="text-sm font-bold text-primary mb-3">Entrepreneur</h4>
                {(() => {
                  const ent = getEnt(selectedMatch.entrepreneur_id);
                  if (!ent) return <p className="text-sm text-muted-foreground">Unknown</p>;
                  return (
                    <div className="space-y-2 text-sm">
                      {ent.photo_url && <img src={ent.photo_url} alt={ent.name} className="w-14 h-14 rounded-xl object-cover" />}
                      <div><span className="text-muted-foreground">Name:</span> <p className="font-medium">{ent.name}</p></div>
                      {ent.business_name && <div><span className="text-muted-foreground">Business:</span> <p>{ent.business_name}</p></div>}
                      {ent.country && <div><span className="text-muted-foreground">Country:</span> <p>{ent.country}</p></div>}
                      {ent.sector && <div><span className="text-muted-foreground">Sector:</span> <p>{ent.sector}</p></div>}
                      {ent.email && <div><span className="text-muted-foreground">Email:</span> <p>{ent.email}</p></div>}
                      <div><span className="text-muted-foreground">Status:</span>
                        <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          ent.status === 'Matched' ? 'bg-accent/10 text-accent' : ent.status === 'Alumni' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>{ent.status}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <h4 className="text-sm font-bold text-accent mb-3">Coach</h4>
                {(() => {
                  const coach = getCoach(selectedMatch.coach_id);
                  if (!coach) return <p className="text-sm text-muted-foreground">Unknown</p>;
                  return (
                    <div className="space-y-2 text-sm">
                      {coach.photo_url && <img src={coach.photo_url} alt={coach.name} className="w-14 h-14 rounded-xl object-cover" />}
                      <div><span className="text-muted-foreground">Name:</span> <p className="font-medium">{coach.name}</p></div>
                      {coach.organization && <div><span className="text-muted-foreground">Organization:</span> <p>{coach.organization}</p></div>}
                      {coach.specialization && <div><span className="text-muted-foreground">Specialization:</span> <p>{coach.specialization}</p></div>}
                      {coach.email && <div><span className="text-muted-foreground">Email:</span> <p>{coach.email}</p></div>}
                      <div><span className="text-muted-foreground">Status:</span>
                        <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          coach.status === 'Matched' ? 'bg-accent/10 text-accent' : 'bg-secondary text-muted-foreground'
                        }`}>{coach.status}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            {selectedMatch.notes && (
              <div className="mt-4 text-sm bg-secondary/30 rounded-xl p-4">
                <span className="font-medium text-muted-foreground">Notes:</span>
                <p className="mt-1 whitespace-pre-line">{selectedMatch.notes}</p>
              </div>
            )}
            <div className="mt-3 text-xs text-muted-foreground">
              Created: {new Date(selectedMatch.created_at).toLocaleDateString()} at {new Date(selectedMatch.created_at).toLocaleTimeString()}
            </div>
            {!isReadOnly && (
              <div className="flex gap-3 mt-5">
                {selectedMatch.status === 'active' && (
                  <>
                    <Button size="sm" onClick={() => handleEndCoaching(selectedMatch)} className="flex-1 bg-accent text-accent-foreground">End Coaching</Button>
                    <Button size="sm" variant="outline" onClick={() => handleUnmatch(selectedMatch)} className="flex-1">Unmatch</Button>
                  </>
                )}
                <Button size="sm" variant="outline" onClick={() => handleDelete(selectedMatch.id)} className="text-destructive border-destructive/30">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedMatches.map(match => (
          <div key={match.id} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => setSelectedMatch(match)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-accent" />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  match.status === 'active' ? 'bg-accent/10 text-accent' :
                  match.status === 'completed' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>{match.status}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedMatch(match); }} className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Entrepreneur:</span><p className="font-medium">{getEntName(match.entrepreneur_id)}</p></div>
              <div><span className="text-muted-foreground">Coach:</span><p className="font-medium">{getCoachName(match.coach_id)}</p></div>
              {match.program_id && (
                <div className="text-xs text-primary bg-primary/5 rounded-lg px-2 py-1">
                  📋 {getProgramName(match.program_id)}
                </div>
              )}
              {match.request_id && (
                <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-2 py-1">
                  📋 Linked to request
                </div>
              )}
              {(() => {
                const project = getProjectForMatch(match.id);
                if (project) return (
                  <div className="text-xs text-accent bg-accent/5 rounded-lg px-2 py-1 flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" /> {project.name}
                  </div>
                );
                return null;
              })()}
              {match.notes && <p className="text-xs text-muted-foreground line-clamp-2">{match.notes}</p>}
              <div className="text-xs text-muted-foreground pt-1">{new Date(match.created_at).toLocaleDateString()}</div>
              {!isReadOnly && match.status === 'active' && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); handleEndCoaching(match); }} className="bg-accent text-accent-foreground text-xs">End Coaching</Button>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleUnmatch(match); }} className="text-xs">Unmatch</Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {paginatedMatches.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            {searchQuery || statusFilter !== 'all' ? 'No matches found with current filters.' : 'No matches created yet.'}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-3">
          <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
