import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Loader2, Plus, Trash2, Download, X, Upload, FileText, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminResources() {
  const { user, userRole, programId, coachId } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  // Form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'General', visibility: 'public', program_id: '' });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const canCreate = userRole === 'admin' || userRole === 'program_admin';

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('resources').select('*', { count: 'exact' });
    if (search) query = query.ilike('title', `%${search}%`);
    if (visibilityFilter) query = query.eq('visibility', visibilityFilter);
    if (categoryFilter) query = query.eq('category', categoryFilter);

    const { data, count } = await query.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setResources(data || []);
    setTotal(count ?? 0);

    const { data: progs } = await supabase.from('programs').select('id, name');
    setPrograms(progs || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, visibilityFilter, categoryFilter]);

  const handleUpload = async () => {
    if (!file || !form.title) return;
    setSaving(true);

    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('resources').upload(path, file);
    if (uploadErr) {
      toast.error('Upload failed: ' + uploadErr.message);
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('resources').getPublicUrl(path);

    await supabase.from('resources').insert({
      title: form.title,
      description: form.description || null,
      file_url: urlData.publicUrl,
      file_type: ext || null,
      category: form.category,
      visibility: form.visibility,
      program_id: form.visibility === 'private' ? (form.program_id || (userRole === 'program_admin' ? programId : null)) : null,
      uploaded_by: user?.id,
    });

    toast.success('Resource uploaded!');
    setSaving(false); setShowForm(false); setFile(null);
    setForm({ title: '', description: '', category: 'General', visibility: 'public', program_id: '' });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    await supabase.from('resources').delete().eq('id', id);
    toast.success('Resource deleted');
    fetchData();
  };

  const getProgramName = (id: string | null) => programs.find(p => p.id === id)?.name || '—';
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const categories = [...new Set(resources.map(r => r.category).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Resource Library ({total})</h2>
        {canCreate && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Upload Resource
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm" />
        </div>
        <select value={visibilityFilter} onChange={e => { setVisibilityFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
          <option value="">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        {categories.length > 0 && (
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Upload Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Upload Resource</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title *"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={2} />
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category (e.g. Templates, Guides)"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                <option value="public">Public — visible to all</option>
                <option value="private">Private — program only</option>
              </select>
              {form.visibility === 'private' && userRole === 'admin' && (
                <select value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">
                  <option value="">Select Program</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" id="res-file" />
                <label htmlFor="res-file" className="cursor-pointer text-sm text-muted-foreground">
                  {file ? <span className="text-foreground font-medium">{file.name}</span> : (
                    <span className="flex flex-col items-center gap-1"><Upload className="h-5 w-5" />Click to select file</span>
                  )}
                </label>
              </div>
              <Button onClick={handleUpload} disabled={saving || !form.title || !file} className="w-full bg-primary text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-3">
          {resources.map(r => (
            <div key={r.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{r.title}</p>
                  {r.visibility === 'private' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      <Lock className="h-2.5 w-2.5" /> {getProgramName(r.program_id)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
                      <Globe className="h-2.5 w-2.5" /> Public
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{r.category}</span>
                </div>
                {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                </a>
                {canCreate && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {resources.length === 0 && <div className="text-center py-10 text-muted-foreground">No resources found.</div>}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
