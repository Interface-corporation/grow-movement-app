import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Users, Handshake, FolderKanban, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--grow-gold, 45 93% 55%))', 'hsl(var(--grow-sage, 150 25% 60%))'];

export default function CoachDashboard() {
  const { coachId } = useAuth();
  const [stats, setStats] = useState({ matches: 0, projects: 0, programs: 0, trained: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [matchStatusData, setMatchStatusData] = useState<any[]>([]);
  const [projectStatusData, setProjectStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coachId) return;
    const fetch = async () => {
      const [matchesRes, projectsRes, programsRes] = await Promise.all([
        supabase.from('matches').select('*').eq('coach_id', coachId),
        supabase.from('projects').select('*').eq('coach_id', coachId).order('created_at', { ascending: false }).limit(5),
        supabase.from('program_coaches').select('id', { count: 'exact', head: true }).eq('coach_id', coachId),
      ]);

      const allMatches = matchesRes.data || [];
      const completedCount = allMatches.filter(m => m.status === 'completed').length;
      const activeCount = allMatches.filter(m => m.status === 'active').length;
      const cancelledCount = allMatches.filter(m => m.status === 'cancelled').length;

      setStats({
        matches: allMatches.length,
        projects: projectsRes.data?.length ?? 0,
        programs: programsRes.count ?? 0,
        trained: completedCount,
      });
      setRecentProjects(projectsRes.data || []);

      // Match status breakdown
      setMatchStatusData([
        { name: 'Active', value: activeCount },
        { name: 'Completed', value: completedCount },
        { name: 'Cancelled', value: cancelledCount },
      ].filter(d => d.value > 0));

      // Project status breakdown
      const projStatusMap: Record<string, number> = {};
      (projectsRes.data || []).forEach((p: any) => { projStatusMap[p.status] = (projStatusMap[p.status] || 0) + 1; });
      setProjectStatusData(Object.entries(projStatusMap).map(([name, value]) => ({ name, value })));

      setLoading(false);
    };
    fetch();
  }, [coachId]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Coach Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Award, label: 'Trained', val: stats.trained, color: 'text-accent' },
          { icon: FolderKanban, label: 'Programs', val: stats.programs, color: 'text-primary' },
          { icon: Handshake, label: 'Matches', val: stats.matches, color: 'text-primary' },
          { icon: FolderKanban, label: 'Projects', val: stats.projects, color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
            <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
            <p className="text-2xl font-bold">{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matchStatusData.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-lg font-bold mb-4">Matches by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={matchStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {projectStatusData.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-lg font-bold mb-4">Projects by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                  {projectStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-3">Recent Projects</h3>
        {recentProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {recentProjects.map(p => (
              <Link key={p.id} to="/admin/projects" className="block bg-card rounded-xl border border-border p-3 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
