import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Users, Handshake, FolderKanban, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CoachDashboard() {
  const { coachId } = useAuth();
  const [stats, setStats] = useState({ matches: 0, projects: 0, programs: 0, trained: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coachId) return;
    const fetch = async () => {
      const [matchesRes, projectsRes, programsRes] = await Promise.all([
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('coach_id', coachId),
        supabase.from('projects').select('*').eq('coach_id', coachId).order('created_at', { ascending: false }).limit(5),
        supabase.from('program_coaches').select('id', { count: 'exact', head: true }).eq('coach_id', coachId),
      ]);
      const completedMatches = await supabase.from('matches').select('id', { count: 'exact', head: true }).eq('coach_id', coachId).eq('status', 'Completed');

      setStats({
        matches: matchesRes.count ?? 0,
        projects: projectsRes.data?.length ?? 0,
        programs: programsRes.count ?? 0,
        trained: completedMatches.count ?? 0,
      });
      setRecentProjects(projectsRes.data || []);
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
