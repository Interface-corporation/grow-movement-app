import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2, X, Eye, EyeOff, Search } from 'lucide-react';
import { logActivity } from '@/lib/activityLog';
import FileUpload from '@/components/FileUpload';

const emptyForm = { title: '', slug: '', excerpt: '', content: '', cover_image_url: '', published: false };
type PubFilter = 'all' | 'published' | 'draft';
const PAGE_SIZE = 9;

export default function AdminBlog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pubFilter, setPubFilter] = useState<PubFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const filtered = posts.filter(p => {
    if (pubFilter === 'published' && !p.published) return false;
    if (pubFilter === 'draft' && p.published) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: form.title, slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt || null, content: form.content,
      cover_image_url: form.cover_image_url || null, published: form.published, author_id: user?.id,
    };
    if (editing) {
      await supabase.from('blog_posts').update(payload).eq('id', editing);
      await logActivity('Updated blog post', 'blog_post', editing, { title: form.title });
    } else {
      const { data: inserted } = await supabase.from('blog_posts').insert(payload).select('id').single();
      await logActivity('Created blog post', 'blog_post', inserted?.id, { title: form.title });
    }
    setSaving(false); setShowForm(false); setEditing(null); setForm(emptyForm); fetchData();
  };

  const handleEdit = (post: any) => {
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content, cover_image_url: post.cover_image_url || '', published: post.published });
    setEditing(post.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    const post = posts.find(p => p.id === id);
    await supabase.from('blog_posts').delete().eq('id', id);
    await logActivity('Deleted blog post', 'blog_post', id, { title: post?.title });
    fetchData();
  };

  const togglePublish = async (id: string, published: boolean) => {
    await supabase.from('blog_posts').update({ published: !published }).eq('id', id);
    const post = posts.find(p => p.id === id);
    await logActivity(published ? 'Unpublished blog post' : 'Published blog post', 'blog_post', id, { title: post?.title });
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Blog Posts ({posts.length})</h2>
        <Button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search posts..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1">
          {(['all', 'published', 'draft'] as PubFilter[]).map(s => (
            <button key={s} onClick={() => { setPubFilter(s); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                pubFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'New'} Blog Post</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => { setForm({...form, title: e.target.value, slug: generateSlug(e.target.value)}); }} placeholder="Title *" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
              <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="Slug" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-muted-foreground" />
              {/* <input value={form.cover_image_url} onChange={e => setForm({...form, cover_image_url: e.target.value})} placeholder="Cover Image URL" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" /> */}
              <FileUpload
                bucket="blog-covers"
                accept="image/*"
                label="Blog Cover Image"
                currentUrl={form.cover_image_url}
                onUpload={(url) => setForm({ ...form, cover_image_url: url })}
                onRemove={() => setForm({ ...form, cover_image_url: '' })}
              />

              <textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="Excerpt (short description)" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={2} />
              <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Content *" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={10} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="rounded" />
                Publish immediately
              </label>
            </div>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.content} className="w-full mt-4 bg-primary text-primary-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? 'Update' : 'Create'} Post
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map(post => (
          <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden">
            {post.cover_image_url && <img src={post.cover_image_url} alt="" className="w-full h-40 object-cover" />}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${post.published ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <h3 className="font-bold text-foreground mb-1">{post.title}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{post.excerpt || post.content.substring(0, 100)}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => togglePublish(post.id, post.published)} title={post.published ? 'Unpublish' : 'Publish'}>
                  {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">No blog posts found.</div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-3">
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
