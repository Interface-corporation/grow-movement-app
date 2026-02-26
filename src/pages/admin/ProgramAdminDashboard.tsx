import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Users, UserPlus, Handshake, FolderKanban } from 'lucide-react';

export default function ProgramAdminDashboard() {
  const { programId } = useAuth();
  const [stats, setStats] = useState({ entrepreneurs: 0, coaches: 0, matches: 0, projects: 0 });
  const [programName, setProgramName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) return;
    const fetch = async () => {
      const [prog, ents, coaches, matches, projects] = await Promise.all([
        supabase.from('programs').select('name').eq('id', programId).single(),
        supabase.from('entrepreneurs').select('id', { count: 'exact', head: true }).eq('program_id', programId),
        supabase.from('program_coaches').select('id', { count: 'exact', head: true }).eq('program_id', programId),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('program_id', programId),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('program_id', programId),
      ]);
      setProgramName(prog.data?.name || 'Program');
      setStats({
        entrepreneurs: ents.count ?? 0,
        coaches: coaches.count ?? 0,
        matches: matches.count ?? 0,
        projects: projects.count ?? 0,
      });
      setLoading(false);
    };
    fetch();
  }, [programId]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

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
    </div>
  );
}
