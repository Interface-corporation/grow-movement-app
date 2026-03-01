import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, X, User, Briefcase, Hash, XCircle, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CoachMatchingRequests() {
  const { session } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    const { data } = await supabase
      .from('matching_requests')
      .select('*')
      .eq('requester_email', session.user.email.toLowerCase())
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }, [session?.user?.email]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Subscribe to real-time updates for this coach's requests
  useEffect(() => {
    if (!session?.user?.email) return;
    const channel = supabase
      .channel('coach-requests')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matching_requests',
        filter: `requester_email=eq.${session.user.email.toLowerCase()}`,
      }, (payload) => {
        setRequests(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
        if (selected?.id === payload.new.id) {
          setSelected((prev: any) => prev ? { ...prev, ...payload.new } : prev);
        }
        toast.info(`Request status updated to "${payload.new.status}"`);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.email, selected?.id]);

  const cancelRequest = async (id: string) => {
    setCancelling(id);
    const { error } = await supabase.from('matching_requests').update({ status: 'cancelled' }).eq('id', id);
    if (error) {
      toast.error('Failed to cancel request');
    } else {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      if (selected?.id === id) setSelected((prev: any) => prev ? { ...prev, status: 'cancelled' } : prev);
      toast.success('Request cancelled');
    }
    setCancelling(null);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'reviewed': return <Eye className="h-4 w-4 text-primary" />;
      case 'matched': return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
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

  const statusDescription = (status: string) => {
    switch (status) {
      case 'pending': return 'Your request is waiting for review by the admin team.';
      case 'reviewed': return 'Your request has been reviewed and is being considered.';
      case 'matched': return 'Congratulations! You have been matched with an entrepreneur.';
      case 'rejected': return 'Unfortunately, your request was not approved at this time.';
      case 'cancelled': return 'This request has been cancelled.';
      default: return '';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Matching Requests</h2>
        <Button variant="outline" size="sm" onClick={fetchRequests}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">View the status of your matching requests. Statuses update in real-time.</p>

      {requests.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <p className="text-muted-foreground">You haven't submitted any matching requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {statusIcon(req.status)}
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      {Array.isArray(req.entrepreneur_selections) ? `${req.entrepreneur_selections.length} entrepreneur(s)` : 'Matching Request'}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(req.status)}`}>
                    {req.status}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setSelected(req)} className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status description */}
              <p className="mt-2 text-xs text-muted-foreground italic">{statusDescription(req.status)}</p>

              {Array.isArray(req.entrepreneur_selections) && req.entrepreneur_selections.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {req.entrepreneur_selections.slice(0, 3).map((ent: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 text-xs bg-secondary rounded-full px-2.5 py-1">
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">{ent.priority || idx + 1}</span>
                      {ent.name}
                    </span>
                  ))}
                  {req.entrepreneur_selections.length > 3 && (
                    <span className="text-xs text-muted-foreground self-center">+{req.entrepreneur_selections.length - 3} more</span>
                  )}
                </div>
              )}

              {req.status === 'pending' && (
                <div className="mt-3 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => cancelRequest(req.id)} disabled={cancelling === req.id}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    {cancelling === req.id ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <XCircle className="mr-1.5 h-3 w-3" />}
                    Cancel Request
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Request Details</h3>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(selected.status)}`}>
                  {selected.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground italic bg-secondary/30 rounded-xl p-3">{statusDescription(selected.status)}</p>

              {selected.message && (
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Your Message</p>
                  <p className="text-sm">{selected.message}</p>
                </div>
              )}

              {selected.support_description && (
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Support Offered</p>
                  <p className="text-sm">{selected.support_description}</p>
                </div>
              )}

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
                        <span className="text-xs text-muted-foreground">#{ent.priority || idx + 1}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No entrepreneurs selected.</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Submitted {new Date(selected.created_at).toLocaleDateString()}
              </p>

              {selected.status === 'pending' && (
                <div className="pt-2 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => cancelRequest(selected.id)} disabled={cancelling === selected.id}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    {cancelling === selected.id ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <XCircle className="mr-1.5 h-3 w-3" />}
                    Cancel Request
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
