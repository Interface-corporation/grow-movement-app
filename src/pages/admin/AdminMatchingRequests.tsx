import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, X, ShieldCheck, ShieldX, Search, User, Briefcase, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logActivity } from '@/lib/activityLog';
import { useAuth } from '@/contexts/AuthContext';

type ReqStatusFilter = 'all' | 'pending' | 'reviewed' | 'matched' | 'rejected' | 'cancelled';
const PAGE_SIZE = 10;

export default function AdminMatchingRequests() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [requests, setRequests] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReqStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const [reqRes, coachRes] = await Promise.all([
        supabase.from('matching_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('coaches').select('email, status').in('status', ['Accepted', 'Unmatched']),
      ]);
      setRequests(reqRes.data || []);
      setCoaches(coachRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const isVerifiedCoach = (email: string) => coaches.some(c => c.email?.toLowerCase() === email?.toLowerCase());

  const updateStatus = async (id: string, status: string) => {
    if (!isAdmin) return;
    await supabase.from('matching_requests').update({ status }).eq('id', id);
    await logActivity(`Matching request ${status}`, 'matching_request', id, { status });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const filtered = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (r.requester_name || '').toLowerCase().includes(q) || (r.requester_email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    reviewed: requests.filter(r => r.status === 'reviewed').length,
    matched: requests.filter(r => r.status === 'matched').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-600',
      reviewed: 'bg-primary/10 text-primary',
      matched: 'bg-accent/10 text-accent',
      rejected: 'bg-destructive/10 text-destructive',
      cancelled: 'bg-muted text-muted-foreground',
    };
    return styles[status] || 'bg-muted text-muted-foreground';
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Matching Requests ({requests.length})</h2>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or email..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'pending', 'reviewed', 'matched', 'rejected', 'cancelled'] as ReqStatusFilter[]).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Request Details</h3>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{selected.requester_name}</p>
                  <p className="text-xs text-muted-foreground">{selected.requester_role}</p>
                </div>
                <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-medium text-xs break-all">{selected.requester_email}</p>
                  {isVerifiedCoach(selected.requester_email) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full mt-1"><ShieldCheck className="h-3 w-3" /> Verified Coach</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full mt-1"><ShieldX className="h-3 w-3" /> Not Verified</span>
                  )}
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Organization</p>
                  <p className="font-medium text-xs">{selected.requester_organization || '—'}</p>
                </div>
              </div>

              {selected.message && (
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Reason for Selection</p>
                  <p className="text-sm">{selected.message}</p>
                </div>
              )}

              {selected.support_description && (
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Support Offered</p>
                  <p className="text-sm">{selected.support_description}</p>
                </div>
              )}

              {/* Polished Entrepreneur Selections */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Selected Entrepreneurs</p>
                <div className="space-y-2">
                  {Array.isArray(selected.entrepreneur_selections) && selected.entrepreneur_selections.length > 0 ? (
                    selected.entrepreneur_selections.map((ent: any, idx: number) => (
                      <div key={ent.entrepreneur_id || idx} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                        <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                          {ent.priority || idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {ent.name || 'Unknown'}
                          </p>
                          {ent.business_name && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                              <Briefcase className="h-3 w-3 shrink-0" />
                              {ent.business_name}
                            </p>
                          )}
                        </div>
                        <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">Priority {ent.priority || idx + 1}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No entrepreneurs selected.</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Submitted {new Date(selected.created_at).toLocaleDateString()} at {new Date(selected.created_at).toLocaleTimeString()}
              </p>

              {/* Only admin can change status */}
              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button size="sm" onClick={() => updateStatus(selected.id, 'reviewed')} className="bg-primary text-primary-foreground">Mark Reviewed</Button>
                  <Button size="sm" onClick={() => updateStatus(selected.id, 'matched')} className="bg-accent text-accent-foreground">Mark Matched</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'rejected')}>Reject</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium">Verified</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map(req => (
                <tr key={req.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{req.requester_name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{req.requester_email}</td>
                  <td className="px-4 py-3">
                    {isVerifiedCoach(req.requester_email) ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full"><ShieldCheck className="h-3 w-3" /> Verified</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full"><ShieldX className="h-3 w-3" /> No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelected(req)}><Eye className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No matching requests found.</td></tr>
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
    </div>
  );
}
