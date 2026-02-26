import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Users, UserPlus, Handshake, FolderKanban } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--grow-gold, 45 93% 55%))', 'hsl(var(--grow-sage, 150 25% 60%))'];

export default function ProgramAdminDashboard() {
  const { programId } = useAuth();
  const [stats, setStats] = useState({ entrepreneurs: 0, coaches: 0, matches: 0, projects: 0 });
  const [programName, setProgramName] = useState('');
  const [loading, setLoading] = useState(true);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectStatusData, setProjectStatusData] = useState<any[]>([]);

  useEffect(() => {
    if (!programId) return;
    const fetchAll = async () => {
      const [prog, ents, coachesRes, matches, projs] = await Promise.all([
        supabase.from('programs').select('name').eq('id', programId).single(),
        supabase.from('entrepreneurs').select('id, name, business_name, status').eq('program_id', programId),
        supabase.from('program_coaches').select('coach_id, coaches(id, name, organization, status)').eq('program_id', programId),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('program_id', programId),
        supabase.from('projects').select('id, name, status').eq('program_id', programId),
      ]);
      setProgramName(prog.data?.name || 'Program');
      const entList = ents.data || [];
      const coachList = (coachesRes.data || []).map((pc: any) => pc.coaches);
      const projList = projs.data || [];
      setEntrepreneurs(entList);
      setCoaches(coachList);
      setProjects(projList);
      setStats({
        entrepreneurs: entList.length,
        coaches: coachList.length,
        matches: matches.count ?? 0,
        projects: projList.length,
      });

      // Project status breakdown
      const statusMap: Record<string, number> = {};
      projList.forEach((p: any) => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
      setProjectStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));

      setLoading(false);
    };
    fetchAll();
  }, [programId]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const chartData = [
    { name: 'Entrepreneurs', value: stats.entrepreneurs },
    { name: 'Coaches', value: stats.coaches },
    { name: 'Matches', value: stats.matches },
    { name: 'Projects', value: stats.projects },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{programName} — Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: UserPlus, label: 'Entrepreneurs', val: stats.entrepreneurs },
          { icon: Users, label: 'Coaches', val: stats.coaches },
          { icon: Handshake, label: 'Matches', val: stats.matches },
          { icon: FolderKanban, label: 'Projects', val: stats.projects },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
            <s.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
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
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {projectStatusData.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-lg font-bold mb-4">Project Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
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

      {/* Entity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-lg font-bold mb-3">Entrepreneurs ({entrepreneurs.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {entrepreneurs.map(e => (
              <div key={e.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-xl text-sm">
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.business_name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'Matched' ? 'bg-primary/10 text-primary' : e.status === 'Alumni' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>{e.status}</span>
              </div>
            ))}
            {entrepreneurs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No entrepreneurs assigned.</p>}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-lg font-bold mb-3">Coaches ({coaches.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {coaches.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-xl text-sm">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.organization || '—'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'Matched' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{c.status}</span>
              </div>
            ))}
            {coaches.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No coaches assigned.</p>}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-lg font-bold mb-3">Projects ({projects.length})</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {projects.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-xl text-sm">
              <p className="font-medium">{p.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-accent/10 text-accent' : p.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
            </div>
          ))}
          {projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No projects yet.</p>}
        </div>
      </div>
    </div>
  );
}
