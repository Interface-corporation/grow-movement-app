import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { toast } from '@/hooks/use-toast';
import {
  Trophy, Play, Square, Plus, Trash2, Users, Vote, Crown, Filter, Search, Loader2, Calendar,
} from 'lucide-react';

const sb = supabase as any;
const COLORS = ['#FC5647', '#F5A623', '#0EA5A0', '#7CB69D', '#1A1F36', '#9b51e0'];

export default function AdminSeedFundVotes() {
  const [comps, setComps] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [votes, setVotes] = useState<any[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Grow Women Seed Fund');
  const [newEdition, setNewEdition] = useState(new Date().getFullYear().toString());
  const [newDate, setNewDate] = useState('');

  const [addCandOpen, setAddCandOpen] = useState(false);
  const [pickEntId, setPickEntId] = useState('');
  const [raising, setRaising] = useState('');

  const [filter, setFilter] = useState('');

  const reload = async () => {
    setLoading(true);
    const { data: list } = await sb.from('seed_fund_competitions').select('*').order('created_at', { ascending: false });
    setComps(list || []);
    const cur = (list || [])[0] || null;
    setActive(cur);
    if (cur) await loadCompetition(cur.id);
    const { data: ents } = await sb.from('entrepreneurs')
      .select('id,name,business_name,country,sector,status,photo_url,gender')
      .in('status', ['Seed Fund Candidate', 'Admitted', 'Matched']);
    setEntrepreneurs(ents || []);
    setLoading(false);
  };

  const loadCompetition = async (id: string) => {
    const [{ data: cands }, { data: tally }, { data: vs }] = await Promise.all([
      sb.from('seed_fund_candidates')
        .select('id, raising_for, display_order, entrepreneur:entrepreneurs(id,name,business_name,country,sector,photo_url,gender,status)')
        .eq('competition_id', id).order('display_order'),
      sb.rpc('get_seed_fund_vote_counts', { _competition_id: id }),
      sb.from('seed_fund_votes').select('*').eq('competition_id', id).order('created_at', { ascending: false }),
    ]);
    setCandidates(cands || []);
    const map: Record<string, number> = {};
    (tally || []).forEach((r: any) => { map[r.candidate_id] = Number(r.votes || 0); });
    setCounts(map);
    setVotes(vs || []);
  };

  useEffect(() => { reload(); }, []);

  const totalVotes = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const ranked = useMemo(() =>
    candidates.map(c => ({ ...c, v: counts[c.id] || 0 }))
      .sort((a, b) => b.v - a.v),
    [candidates, counts]
  );
  const winner = ranked[0];

  const chartData = ranked.map(c => ({
    name: c.entrepreneur?.name?.split(' ')[0] || '—', votes: c.v,
  }));

  const filteredVotes = votes.filter(v =>
    !filter || v.voter_email.toLowerCase().includes(filter.toLowerCase()) || (v.voter_name || '').toLowerCase().includes(filter.toLowerCase())
  );

  const createComp = async () => {
    if (!newTitle) return;
    const { data, error } = await sb.from('seed_fund_competitions').insert({
      title: newTitle, edition: newEdition || null,
      event_date: newDate ? new Date(newDate).toISOString() : null,
      status: 'draft',
    }).select().single();
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Competition created' });
    setNewOpen(false);
    setActive(data); await reload();
  };

  const setStatus = async (status: string) => {
    if (!active) return;
    const { error } = await sb.from('seed_fund_competitions').update({ status }).eq('id', active.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: `Competition ${status}` });
    await reload();
  };

  const addCandidate = async () => {
    if (!active || !pickEntId) return;
    const { error } = await sb.from('seed_fund_candidates').insert({
      competition_id: active.id, entrepreneur_id: pickEntId,
      raising_for: raising || null, display_order: candidates.length,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    // also mark entrepreneur as Seed Fund Candidate
    await sb.from('entrepreneurs').update({ status: 'Seed Fund Candidate' }).eq('id', pickEntId);
    setPickEntId(''); setRaising(''); setAddCandOpen(false);
    await loadCompetition(active.id);
  };

  const removeCandidate = async (id: string) => {
    if (!confirm('Remove this candidate?')) return;
    await sb.from('seed_fund_candidates').delete().eq('id', id);
    await loadCompetition(active.id);
  };

  const promoteToAlumni = async () => {
    if (!active) return;
    if (!confirm('Mark all candidates of this competition as Seed Fund Alumni?')) return;
    const ids = candidates.map(c => c.entrepreneur?.id).filter(Boolean);
    if (ids.length) await sb.from('entrepreneurs').update({ status: 'Seed Fund Alumni' }).in('id', ids);
    toast({ title: 'Candidates promoted to Alumni' });
    await reload();
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Seed Fund Voting</h1>
          <p className="text-muted-foreground">Manage competitions, candidates and live results.</p>
        </div>
        <div className="flex gap-2">
          <Select value={active?.id || ''} onValueChange={(v) => { const c = comps.find(x => x.id === v); setActive(c); loadCompetition(v); }}>
            <SelectTrigger className="w-[260px]"><SelectValue placeholder="Select a competition" /></SelectTrigger>
            <SelectContent>
              {comps.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.title} {c.edition ? `· ${c.edition}` : ''} ({c.status})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setNewOpen(true)}><Plus /> New</Button>
        </div>
      </div>

      {active && (
        <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-4">
          <div className="flex-1 min-w-[240px]">
            <div className="text-xs uppercase text-muted-foreground tracking-widest">Selected competition</div>
            <div className="font-semibold text-lg">{active.title} {active.edition && `· ${active.edition}`}</div>
            {active.event_date && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" /> {new Date(active.event_date).toLocaleDateString()}</div>}
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            active.status === 'active' ? 'bg-green-100 text-green-800' :
            active.status === 'ended' ? 'bg-grow-gold/20 text-grow-gold' : 'bg-muted text-muted-foreground'
          }`}>{active.status.toUpperCase()}</span>
          {active.status !== 'active' && <Button size="sm" onClick={() => setStatus('active')} className="bg-grow-teal hover:bg-grow-teal/90"><Play /> Start</Button>}
          {active.status === 'active' && <Button size="sm" variant="destructive" onClick={() => setStatus('ended')}><Square /> End</Button>}
          {active.status === 'ended' && <Button size="sm" variant="outline" onClick={promoteToAlumni}><Crown /> Promote to Alumni</Button>}
        </div>
      )}

      {!active ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          No competition yet. Click <strong>New</strong> to create one.
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates ({candidates.length})</TabsTrigger>
            <TabsTrigger value="votes">Votes ({votes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Stat icon={Users} label="Candidates" value={candidates.length} />
              <Stat icon={Vote}  label="Total Votes" value={totalVotes} />
              <Stat icon={Trophy} label="Leader" value={winner?.entrepreneur?.name || '—'} sub={winner ? `${winner.v} votes` : ''} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Votes per candidate</CardTitle></CardHeader>
                <CardContent style={{ height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="votes" fill="#FC5647" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Share of votes</CardTitle></CardHeader>
                <CardContent style={{ height: 320 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={chartData} dataKey="votes" nameKey="name" outerRadius={110} label>
                        {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ranked.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-grow-gold text-grow-navy' : 'bg-muted text-foreground'}`}>{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{c.entrepreneur?.name}</div>
                        <div className="text-xs text-muted-foreground">{c.entrepreneur?.business_name} · {c.entrepreneur?.country}</div>
                      </div>
                      <div className="font-bold text-grow-coral">{c.v} votes</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={() => setAddCandOpen(true)}><Plus /> Add candidate</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map(c => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex gap-3 items-start">
                    <div className="flex-1">
                      <div className="font-bold">{c.entrepreneur?.name}</div>
                      <div className="text-sm text-muted-foreground">{c.entrepreneur?.business_name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{c.entrepreneur?.country} · {c.entrepreneur?.sector}</div>
                      {c.raising_for && <p className="text-xs mt-2 text-foreground/80">Raising: {c.raising_for}</p>}
                      <div className="text-sm mt-2 font-semibold text-grow-coral">{counts[c.id] || 0} votes</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCandidate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </CardContent>
                </Card>
              ))}
              {candidates.length === 0 && <div className="col-span-full text-muted-foreground text-center py-8">No candidates yet.</div>}
            </div>
          </TabsContent>

          <TabsContent value="votes" className="space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by email or name" className="pl-9" />
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{filteredVotes.length} / {votes.length}</span>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr><th className="p-3">Email</th><th className="p-3">Name</th><th className="p-3">Voted for</th><th className="p-3">When</th></tr>
                </thead>
                <tbody>
                  {filteredVotes.map(v => {
                    const cand = candidates.find(c => c.id === v.candidate_id);
                    return (
                      <tr key={v.id} className="border-t border-border">
                        <td className="p-3 font-mono text-xs">{v.voter_email}</td>
                        <td className="p-3">{v.voter_name || '—'}</td>
                        <td className="p-3">{cand?.entrepreneur?.name || '—'}</td>
                        <td className="p-3 text-muted-foreground">{new Date(v.created_at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {filteredVotes.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No votes yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Create competition modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New competition</DialogTitle><DialogDescription>Create a new seed fund edition.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm">Title</label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
            <div><label className="text-sm">Edition</label><Input value={newEdition} onChange={e => setNewEdition(e.target.value)} placeholder="2026" /></div>
            <div><label className="text-sm">Event date</label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button><Button onClick={createComp}>Create</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add candidate modal */}
      <Dialog open={addCandOpen} onOpenChange={setAddCandOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add candidate</DialogTitle><DialogDescription>Pick an entrepreneur. They will be marked "Seed Fund Candidate".</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Select value={pickEntId} onValueChange={setPickEntId}>
              <SelectTrigger><SelectValue placeholder="Choose entrepreneur" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {entrepreneurs.filter(e => !candidates.some(c => c.entrepreneur?.id === e.id)).map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {e.business_name} ({e.country})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div><label className="text-sm">Raising money for</label><Input value={raising} onChange={e => setRaising(e.target.value)} placeholder="e.g. Expand production capacity" /></div>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setAddCandOpen(false)}>Cancel</Button><Button onClick={addCandidate} disabled={!pickEntId}>Add</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <Card><CardContent className="p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-grow-coral/10 flex items-center justify-center"><Icon className="h-6 w-6 text-grow-coral" /></div>
      <div>
        <div className="text-xs uppercase text-muted-foreground tracking-widest">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </CardContent></Card>
  );
}
