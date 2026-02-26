import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, UserPlus, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logActivity } from '@/lib/activityLog';
import { toast } from 'sonner';

type StatusFilter = 'Pending' | 'Rejected' | 'All';
const PAGE_SIZE = 10;

export default function AdminApplications() {
  const [allEnts, setAllEnts] = useState<any[]>([]);
  const [allCoaches, setAllCoaches] = useState<any[]>([]);
  const [entStatusFilter, setEntStatusFilter] = useState<StatusFilter>('Pending');
  const [coachStatusFilter, setCoachStatusFilter] = useState<StatusFilter>('Pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<'entrepreneur' | 'coach'>('entrepreneur');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [entPage, setEntPage] = useState(0);
  const [coachPage, setCoachPage] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    const [ents, coaches] = await Promise.all([
      supabase.from('entrepreneurs').select('*').in('status', ['Pending', 'Rejected']).order('created_at', { ascending: false }),
      supabase.from('coaches').select('*').in('status', ['Pending', 'Rejected']).order('created_at', { ascending: false }),
    ]);
    setAllEnts(ents.data || []);
    setAllCoaches(coaches.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredEnts = allEnts.filter(e => entStatusFilter === 'All' || e.status === entStatusFilter);
  const filteredCoaches = allCoaches.filter(c => coachStatusFilter === 'All' || c.status === coachStatusFilter);

  const entTotalPages = Math.ceil(filteredEnts.length / PAGE_SIZE);
  const coachTotalPages = Math.ceil(filteredCoaches.length / PAGE_SIZE);
  const paginatedEnts = filteredEnts.slice(entPage * PAGE_SIZE, (entPage + 1) * PAGE_SIZE);
  const paginatedCoaches = filteredCoaches.slice(coachPage * PAGE_SIZE, (coachPage + 1) * PAGE_SIZE);

  const pendingEntCount = allEnts.filter(e => e.status === 'Pending').length;
  const pendingCoachCount = allCoaches.filter(c => c.status === 'Pending').length;

  const handleAdmit = async (id: string, type: 'entrepreneur' | 'coach') => {
    setActionLoading(id);
    const table = type === 'entrepreneur' ? 'entrepreneurs' : 'coaches';
    const newStatus = type === 'entrepreneur' ? 'Admitted' : 'Accepted';
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id);
    if (error) { toast.error(`Failed to admit ${type}: ${error.message}`); setActionLoading(null); return; }
    await logActivity(`Admitted ${type}`, type, id);
    toast.success(`${type === 'entrepreneur' ? 'Entrepreneur' : 'Coach'} admitted successfully!`);
    setSelected(null); setActionLoading(null); fetchData();
  };

  const handleReject = async (id: string, type: 'entrepreneur' | 'coach') => {
    setActionLoading(id);
    const table = type === 'entrepreneur' ? 'entrepreneurs' : 'coaches';
    const { error } = await supabase.from(table).update({ status: 'Rejected' }).eq('id', id);
    if (error) { toast.error(`Failed to reject ${type}: ${error.message}`); setActionLoading(null); return; }
    await logActivity(`Rejected ${type}`, type, id);
    toast.success(`${type === 'entrepreneur' ? 'Entrepreneur' : 'Coach'} rejected.`);
    setSelected(null); setActionLoading(null); fetchData();
  };

  const StatusFilterButtons = ({ value, onChange }: { value: StatusFilter; onChange: (v: StatusFilter) => void }) => (
    <div className="flex gap-1">
      {(['Pending', 'Rejected', 'All'] as StatusFilter[]).map(s => (
        <button key={s} onClick={() => { onChange(s); }}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            value === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}>
          {s}
        </button>
      ))}
    </div>
  );

  const PaginationBar = ({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (fn: (p: number) => number) => void }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Applications</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-display font-bold">{pendingEntCount}</p>
              <p className="text-sm text-muted-foreground">Pending Entrepreneur Applications</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><UserPlus className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-display font-bold">{pendingCoachCount}</p>
              <p className="text-sm text-muted-foreground">Pending Coach Applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">Application Details</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  selected.status === 'Pending' ? 'bg-grow-gold/10 text-grow-gold' :
                  selected.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-accent/10 text-accent'
                }`}>{selected.status}</span>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            {selected.photo_url && (
              <div className="mb-4"><img src={selected.photo_url} alt={selected.name} className="w-20 h-20 rounded-xl object-cover" /></div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-muted-foreground">Name:</span> <p>{selected.name}</p></div>
              {selected.business_name && <div><span className="font-medium text-muted-foreground">Business:</span> <p>{selected.business_name}</p></div>}
              {selected.email && <div><span className="font-medium text-muted-foreground">Email:</span> <p>{selected.email}</p></div>}
              {selected.phone && <div><span className="font-medium text-muted-foreground">Phone:</span> <p>{selected.phone}</p></div>}
              {selected.country && <div><span className="font-medium text-muted-foreground">Country:</span> <p>{selected.country}</p></div>}
              {selected.sector && <div><span className="font-medium text-muted-foreground">Sector:</span> <p>{selected.sector}</p></div>}
              {selected.stage && <div><span className="font-medium text-muted-foreground">Stage:</span> <p>{selected.stage}</p></div>}
              {selected.gender && <div><span className="font-medium text-muted-foreground">Gender:</span> <p>{selected.gender}</p></div>}
              {selected.organization && <div><span className="font-medium text-muted-foreground">Organization:</span> <p>{selected.organization}</p></div>}
              {selected.specialization && <div><span className="font-medium text-muted-foreground">Specialization:</span> <p>{selected.specialization}</p></div>}
              {selected.revenue && <div><span className="font-medium text-muted-foreground">Revenue:</span> <p>{selected.revenue}</p></div>}
              {selected.year_founded && <div><span className="font-medium text-muted-foreground">Year Founded:</span> <p>{selected.year_founded}</p></div>}
              {selected.team_size && <div><span className="font-medium text-muted-foreground">Team Size:</span> <p>{selected.team_size}</p></div>}
              {selected.preferred_communication && <div><span className="font-medium text-muted-foreground">Communication:</span> <p>{selected.preferred_communication}</p></div>}
              {selected.linkedin && <div><span className="font-medium text-muted-foreground">LinkedIn:</span> <p className="break-all">{selected.linkedin}</p></div>}
              {selected.website && <div><span className="font-medium text-muted-foreground">Website:</span> <p className="break-all">{selected.website}</p></div>}
            </div>
            {selected.pitch_summary && <div className="mt-4 text-sm"><span className="font-medium text-muted-foreground">Pitch:</span><p className="mt-1 whitespace-pre-line">{selected.pitch_summary}</p></div>}
            {selected.business_description && <div className="mt-3 text-sm"><span className="font-medium text-muted-foreground">Business Description:</span><p className="mt-1 whitespace-pre-line">{selected.business_description}</p></div>}
            {selected.about_entrepreneur && <div className="mt-3 text-sm"><span className="font-medium text-muted-foreground">About:</span><p className="mt-1 whitespace-pre-line">{selected.about_entrepreneur}</p></div>}
            {selected.funding_needs && <div className="mt-3 text-sm"><span className="font-medium text-muted-foreground">Funding Needs:</span><p className="mt-1 whitespace-pre-line">{selected.funding_needs}</p></div>}
            {selected.coaching_needs && <div className="mt-3 text-sm"><span className="font-medium text-muted-foreground">Coaching Needs:</span><p className="mt-1 whitespace-pre-line">{selected.coaching_needs}</p></div>}
            {selected.bio && <div className="mt-3 text-sm"><span className="font-medium text-muted-foreground">Bio:</span><p className="mt-1 whitespace-pre-line">{selected.bio}</p></div>}
            <div className="flex gap-3 mt-6">
              {selected.status !== 'Admitted' && selected.status !== 'Accepted' && (
                <Button onClick={() => handleAdmit(selected.id, selectedType)} disabled={actionLoading === selected.id} className="flex-1 bg-accent text-accent-foreground">
                  {actionLoading === selected.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {selectedType === 'entrepreneur' ? 'Admit' : 'Accept'}
                </Button>
              )}
              {selected.status !== 'Rejected' && (
                <Button onClick={() => handleReject(selected.id, selectedType)} disabled={actionLoading === selected.id} variant="outline" className="flex-1 text-destructive border-destructive/30">
                  {actionLoading === selected.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Entrepreneur Applications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Entrepreneur Applications ({filteredEnts.length})</h3>
          <StatusFilterButtons value={entStatusFilter} onChange={(v) => { setEntStatusFilter(v); setEntPage(0); }} />
        </div>
        {paginatedEnts.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-xl border border-border p-6 text-center">
            No {entStatusFilter === 'All' ? '' : entStatusFilter.toLowerCase()} applications found.
          </p>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Business</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Country</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedEnts.map(e => (
                    <tr key={e.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{e.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.business_name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{e.country}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          e.status === 'Pending' ? 'bg-grow-gold/10 text-grow-gold' : 'bg-destructive/10 text-destructive'
                        }`}>{e.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => { setSelected(e); setSelectedType('entrepreneur'); }}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" onClick={() => handleAdmit(e.id, 'entrepreneur')} disabled={actionLoading === e.id || e.status === 'Admitted'} className="bg-accent text-accent-foreground text-xs h-8">
                            {actionLoading === e.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Admit'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(e.id, 'entrepreneur')} disabled={actionLoading === e.id || e.status === 'Rejected'} className="text-destructive text-xs h-8">Reject</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar page={entPage} totalPages={entTotalPages} setPage={setEntPage} />
          </div>
        )}
      </div>

      {/* Coach Applications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Coach Applications ({filteredCoaches.length})</h3>
          <StatusFilterButtons value={coachStatusFilter} onChange={(v) => { setCoachStatusFilter(v); setCoachPage(0); }} />
        </div>
        {paginatedCoaches.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-xl border border-border p-6 text-center">
            No {coachStatusFilter === 'All' ? '' : coachStatusFilter.toLowerCase()} applications found.
          </p>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Organization</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedCoaches.map(c => (
                    <tr key={c.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.organization || '—'}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          c.status === 'Pending' ? 'bg-grow-gold/10 text-grow-gold' : 'bg-destructive/10 text-destructive'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => { setSelected(c); setSelectedType('coach'); }}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" onClick={() => handleAdmit(c.id, 'coach')} disabled={actionLoading === c.id || c.status === 'Accepted'} className="bg-accent text-accent-foreground text-xs h-8">
                            {actionLoading === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Accept'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(c.id, 'coach')} disabled={actionLoading === c.id || c.status === 'Rejected'} className="text-destructive text-xs h-8">Reject</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar page={coachPage} totalPages={coachTotalPages} setPage={setCoachPage} />
          </div>
        )}
      </div>
    </div>
  );
}
