import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActionFilter = 'all' | string;
const PAGE_SIZE = 15;

export default function AdminHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [userFilter, setUserFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const [logRes, profileRes] = await Promise.all([
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('profiles').select('user_id, full_name, email'),
      ]);
      setLogs(logRes.data || []);
      const map: Record<string, string> = {};
      (profileRes.data || []).forEach((p: any) => { map[p.user_id] = p.full_name || p.email || 'Unknown'; });
      setProfiles(map);
      setLoading(false);
    };
    fetch();
  }, []);

  const uniqueActions = [...new Set(logs.map(l => l.action))].sort();
  const uniqueUsers = [...new Set(logs.filter(l => l.user_id).map(l => l.user_id))];

  const filtered = logs.filter(l => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    if (userFilter !== 'all' && l.user_id !== userFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.action.toLowerCase().includes(q) || (l.entity_type || '').toLowerCase().includes(q) ||
        (profiles[l.user_id] || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Activity Log ({filtered.length})</h2>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search actions, entities, users..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="px-3 py-1.5 rounded-xl border border-border bg-background text-sm">
            <option value="all">All Actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(0); }}
            className="px-3 py-1.5 rounded-xl border border-border bg-background text-sm">
            <option value="all">All Users</option>
            {uniqueUsers.map(uid => <option key={uid} value={uid}>{profiles[uid] || uid.substring(0, 8)}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No activity found.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Entity</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">User</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Details</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map(log => (
                  <tr key={log.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{log.action}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{log.entity_type || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {log.user_id ? (profiles[log.user_id] || log.user_id.substring(0, 8)) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                      {log.details ? JSON.stringify(log.details).substring(0, 80) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
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
