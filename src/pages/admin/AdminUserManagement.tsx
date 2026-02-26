import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Shield, Search, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { logActivity } from '@/lib/activityLog';

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: { id: string; role: string; program_id: string | null }[];
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', role: 'coach' as string, program_id: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Get all profiles with their roles
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, email');
    const { data: roles } = await supabase.from('user_roles').select('id, user_id, role, program_id');
    const { data: progs } = await supabase.from('programs').select('id, name');
    setPrograms(progs || []);

    // Merge
    const usersMap: Record<string, UserWithRole> = {};
    (roles || []).forEach(r => {
      if (!usersMap[r.user_id]) {
        const profile = (profiles || []).find(p => p.user_id === r.user_id);
        usersMap[r.user_id] = {
          user_id: r.user_id,
          email: profile?.email || '',
          full_name: profile?.full_name || null,
          roles: [],
        };
      }
      usersMap[r.user_id].roles.push({ id: r.id, role: r.role, program_id: r.program_id });
    });

    setUsers(Object.values(usersMap));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddRole = async () => {
    setSaving(true);
    // Find user by email in profiles
    const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', addForm.email).maybeSingle();
    if (!profile) {
      toast.error('User not found. They must have an account first.');
      setSaving(false);
      return;
    }

    const payload: any = { user_id: profile.user_id, role: addForm.role };
    if (addForm.role === 'program_admin' && addForm.program_id) {
      payload.program_id = addForm.program_id;
    }

    const { error } = await supabase.from('user_roles').insert(payload);
    if (error) {
      if (error.message.includes('duplicate')) {
        toast.error('User already has this role.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Role assigned successfully!');
      await logActivity('Assigned role', 'user_role', profile.user_id, { role: addForm.role, email: addForm.email });
      setShowAdd(false);
      setAddForm({ email: '', role: 'coach', program_id: '' });
      fetchData();
    }
    setSaving(false);
  };

  const handleRemoveRole = async (roleId: string, userId: string, roleName: string) => {
    if (!confirm(`Remove ${roleName} role?`)) return;
    await supabase.from('user_roles').delete().eq('id', roleId);
    await logActivity('Removed role', 'user_role', userId, { role: roleName });
    toast.success('Role removed');
    fetchData();
  };

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getProgramName = (id: string | null) => programs.find(p => p.id === id)?.name || '—';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> User Management
        </h2>
        <Button onClick={() => setShowAdd(true)} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Assign Role
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Assign Role Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Assign Role</h3>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">User Email</label>
                <input value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="user@example.com" type="email"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="admin">Admin</option>
                  <option value="program_admin">Program Admin</option>
                  <option value="coach">Coach</option>
                </select>
              </div>
              {addForm.role === 'program_admin' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Program</label>
                  <select value={addForm.program_id} onChange={e => setAddForm({ ...addForm, program_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option value="">Select Program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <Button onClick={handleAddRole} disabled={saving || !addForm.email || !addForm.role} className="w-full bg-primary text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Assign Role
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Roles</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  <tr key={u.user_id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{u.full_name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map(r => (
                          <span key={r.id} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {r.role}
                            {r.role === 'program_admin' && r.program_id ? ` (${getProgramName(r.program_id)})` : ''}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {u.roles.map(r => (
                          <Button key={r.id} variant="ghost" size="icon" className="text-destructive h-7 w-7"
                            onClick={() => handleRemoveRole(r.id, u.user_id, r.role)}
                            title={`Remove ${r.role}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No users with roles found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
