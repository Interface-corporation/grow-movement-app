import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, GitMerge, Handshake, Loader2, ChevronLeft, ChevronRight, FolderKanban, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';

interface Stats {
  entrepreneurs: number;
  coaches: number;
  requests: number;
  matches: number;
  programs: number;
  projects: number;
}

const PAGE_SIZE = 5;

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({ entrepreneurs: 0, coaches: 0, requests: 0, matches: 0, programs: 0, projects: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [reqPage, setReqPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async (page: number) => {
    const { data, count } = await supabase
      .from('matching_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setRecentRequests(data || []);
    setTotalRequests(count ?? 0);
  };

  useEffect(() => {
    const fetchStats = async () => {
      const [ent, coach, req, match, prog, proj] = await Promise.all([
        supabase.from('entrepreneurs').select('id', { count: 'exact', head: true }),
        supabase.from('coaches').select('id', { count: 'exact', head: true }),
        supabase.from('matching_requests').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('programs').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        entrepreneurs: ent.count ?? 0,
        coaches: coach.count ?? 0,
        requests: req.count ?? 0,
        matches: match.count ?? 0,
        programs: prog.count ?? 0,
        projects: proj.count ?? 0,
      });

      await fetchRequests(0);
      setLoading(false);
    };

    fetchStats();
  }, []);

  useEffect(() => { if (!loading) fetchRequests(reqPage); }, [reqPage]);

  const statCards = [
    { label: 'Entrepreneurs', value: stats.entrepreneurs, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Coaches', value: stats.coaches, icon: UserPlus, color: 'bg-accent/10 text-accent' },
    { label: 'Requests', value: stats.requests, icon: GitMerge, color: 'bg-grow-gold/10 text-grow-gold' },
    { label: 'Matches', value: stats.matches, icon: Handshake, color: 'bg-grow-sage/10 text-grow-sage' },
    { label: 'Programs', value: stats.programs, icon: Award, color: 'bg-primary/10 text-primary' },
    { label: 'Projects', value: stats.projects, icon: FolderKanban, color: 'bg-accent/10 text-accent' },
  ];

  const chartData = [
    { name: 'Entrepreneurs', value: stats.entrepreneurs },
    { name: 'Coaches', value: stats.coaches },
    { name: 'Requests', value: stats.requests },
    { name: 'Matches', value: stats.matches },
    { name: 'Programs', value: stats.programs },
    { name: 'Projects', value: stats.projects },
  ];

  const COLORS = ['#FC5647', '#0EA5A0', '#F5A623', '#7CB69D', '#8B5CF6', '#D946EF'];
  const reqTotalPages = Math.ceil(totalRequests / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-foreground">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-lg font-bold mb-4">Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-lg font-bold mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Requests with Pagination */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-lg font-bold mb-4">Recent Matching Requests</h3>
        {recentRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">No requests yet.</p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{req.requester_name}</p>
                  <p className="text-xs text-muted-foreground">{req.requester_email} • {req.requester_role}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  req.status === 'pending' ? 'bg-grow-gold/10 text-grow-gold' :
                  req.status === 'matched' ? 'bg-accent/10 text-accent' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
        {reqTotalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {reqPage + 1} of {reqTotalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={reqPage === 0} onClick={() => setReqPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={reqPage >= reqTotalPages - 1} onClick={() => setReqPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
