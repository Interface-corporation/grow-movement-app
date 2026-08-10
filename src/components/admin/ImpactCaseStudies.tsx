import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Award, Plus, Pencil, Trash2, Loader2, RotateCcw, PlayCircle, Quote, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAutoSave } from '@/hooks/useAutoSave';
import { toEmbedUrl, isDirectVideoFile } from '@/lib/videoEmbed';

const emptyImpactForm = { title: '', project_brief: '', entrepreneur_review: '', coach_review: '', video_url: '', rating: 0 };

/** Clickable 1–5 star rating input. */
function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" aria-label={`Rate ${n} out of 5`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(value === n ? 0 : n)}
          className="p-0.5 transition-transform hover:scale-110">
          <Star className={`h-5 w-5 ${n <= active ? 'fill-grow-gold text-grow-gold' : 'text-muted-foreground'}`} />
        </button>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        {value ? `${value} / 5` : 'Not rated'}
      </span>
    </div>
  );
}

/** Read-only star row. */
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= rating ? 'fill-grow-gold text-grow-gold' : 'text-muted-foreground/40'}`} />
      ))}
    </div>
  );
}

/** Review block with a Read more / Show less toggle. */
function ReviewBlock({ label, author, text, accent }: { label: string; author: string; text: string; accent: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Quote className={`h-4 w-4 ${accent}`} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{author}</p>
        </div>
      </div>
      <p className={`text-sm text-muted-foreground whitespace-pre-line ${!open && long ? 'line-clamp-3' : ''}`}>{text}</p>
      {long && (
        <button onClick={() => setOpen(o => !o)} className="mt-2 text-xs font-semibold text-primary hover:underline">
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

interface Props {
  projectId: string;
  entrepreneurName: string;
  coachName: string;
  canEdit: boolean;
}

/**
 * Impact Case Studies block — shared by the project detail modals in the
 * Programs tab and the Projects tab so both behave identically.
 */
export default function ImpactCaseStudies({ projectId, entrepreneurName, coachName, canEdit }: Props) {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyImpactForm);
  const [saving, setSaving] = useState(false);
  const { clearAutoSave } = useAutoSave('project_impact_form', form, setForm, showForm && !editing);

  const fetchCases = async () => {
    const { data } = await (supabase as any)
      .from('project_impact_cases')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    setCases(data || []);
  };

  useEffect(() => {
    setShowForm(false);
    setEditing(null);
    setCases([]);
    if (projectId) fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleSave = async () => {
    if (!form.entrepreneur_review.trim() && !form.coach_review.trim() && !form.video_url.trim()) {
      toast.error('Add at least one review or a video link');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim() || null,
      project_brief: form.project_brief.trim() || null,
      entrepreneur_review: form.entrepreneur_review.trim() || null,
      coach_review: form.coach_review.trim() || null,
      video_url: form.video_url.trim() || null,
      rating: form.rating || null,
    };
    let error: any = null;
    if (editing) {
      ({ error } = await (supabase as any).from('project_impact_cases').update(payload).eq('id', editing));
    } else {
      ({ error } = await (supabase as any).from('project_impact_cases').insert({
        ...payload, project_id: projectId, created_by: user?.id,
      }));
    }
    setSaving(false);
    if (error) { toast.error('Failed to save impact case: ' + error.message); return; }
    toast.success(editing ? 'Impact case study updated' : 'Impact case study added');
    clearAutoSave();
    setForm(emptyImpactForm);
    setEditing(null);
    setShowForm(false);
    await fetchCases();
  };

  const handleDelete = async (caseId: string) => {
    if (!confirm('Delete this impact case study?')) return;
    await (supabase as any).from('project_impact_cases').delete().eq('id', caseId);
    toast.success('Impact case study deleted');
    await fetchCases();
  };

  const togglePublish = async (ic: any) => {
    const next = !ic.is_published;
    const { error } = await (supabase as any)
      .from('project_impact_cases')
      .update({ is_published: next })
      .eq('id', ic.id);
    if (error) { toast.error('Failed to update visibility: ' + error.message); return; }
    toast.success(next ? 'Published to the public testimonials page' : 'Unpublished — hidden from the public page');
    await fetchCases();
  };

  return (
    <div className="border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h4 className="font-bold flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" /> Impact Case Studies ({cases.length})
        </h4>
        {canEdit && (
          <Button size="sm" onClick={() => { setForm(emptyImpactForm); setEditing(null); setShowForm(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Impact Case Study
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-secondary/30 rounded-xl p-4 mb-4 space-y-3">
          <h5 className="text-sm font-semibold">{editing ? 'Edit' : 'New'} Impact Case Study</h5>
          <div>
            <label className="block text-xs font-medium mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Revenue tripled after 6 coaching sessions"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Brief Project Description</label>
            <textarea value={form.project_brief} onChange={e => setForm({ ...form, project_brief: e.target.value })}
              placeholder="A short summary of what this project was about, the goal and the coaching focus..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={3} />
            <p className="text-[11px] text-muted-foreground mt-1">Hidden on the public testimonial card — only shown when a visitor opens the story.</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Entrepreneur's Review</label>
            <textarea value={form.entrepreneur_review} onChange={e => setForm({ ...form, entrepreneur_review: e.target.value })}
              placeholder="What the entrepreneur says about the coaching journey..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={4} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Coach's Review</label>
            <textarea value={form.coach_review} onChange={e => setForm({ ...form, coach_review: e.target.value })}
              placeholder="What the coach observed and achieved with the entrepreneur..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" rows={4} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Impact Video Link</label>
            <input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })}
              placeholder="YouTube, Vimeo or Google Drive link"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm" />
            <p className="text-[11px] text-muted-foreground mt-1">Paste any share link — it is converted into an embedded player automatically.</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Entrepreneur's Rating</label>
            <StarRatingInput value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
            <p className="text-[11px] text-muted-foreground mt-1">Shown as stars on the public testimonials page.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              {editing ? 'Update' : 'Save'} Case Study
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
            {!editing && (
              <Button size="sm" variant="outline" title="Clear form"
                onClick={() => { setForm(emptyImpactForm); clearAutoSave(); toast.info('Form cleared'); }}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {cases.map(ic => {
          const embed = toEmbedUrl(ic.video_url);
          return (
            <div key={ic.id} className="border border-border rounded-2xl p-4 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{ic.title || 'Impact Case Study'}</p>
                  {ic.project_brief && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 whitespace-pre-line">{ic.project_brief}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{new Date(ic.created_at).toLocaleDateString()}</p>
                    {ic.rating ? <StarRow rating={ic.rating} /> : null}
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ic.is_published ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                    }`}>{ic.is_published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      title={ic.is_published ? 'Unpublish from testimonials page' : 'Publish to testimonials page'}
                      onClick={() => togglePublish(ic)}>
                      {ic.is_published
                        ? <Eye className="h-3.5 w-3.5 text-accent" />
                        : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                      setForm({
                        title: ic.title || '',
                        project_brief: ic.project_brief || '',
                        entrepreneur_review: ic.entrepreneur_review || '',
                        coach_review: ic.coach_review || '',
                        video_url: ic.video_url || '',
                        rating: ic.rating || 0,
                      });
                      setEditing(ic.id); setShowForm(true);
                    }}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ic.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {embed && (
                <div className="rounded-xl overflow-hidden bg-black aspect-video">
                  {isDirectVideoFile(embed)
                    ? <video src={embed} controls className="w-full h-full" />
                    : <iframe src={embed} title={ic.title || 'Testimonial'} className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        allowFullScreen />}
                </div>
              )}
              {ic.video_url && !embed && (
                <a href={ic.video_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <PlayCircle className="h-3.5 w-3.5" /> Open video link
                </a>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ic.entrepreneur_review && (
                  <ReviewBlock label="Entrepreneur's review" author={entrepreneurName}
                    text={ic.entrepreneur_review} accent="text-primary" />
                )}
                {ic.coach_review && (
                  <ReviewBlock label="Coach's review" author={coachName}
                    text={ic.coach_review} accent="text-accent" />
                )}
              </div>
            </div>
          );
        })}
        {cases.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No impact case study yet. Add reviews and an impact video to document this project's impact.
          </p>
        )}
      </div>
    </div>
  );
}
