import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { toast } from '@/hooks/use-toast';
import {
  Trophy, Play, Square, Plus, Trash2, Users, Vote, Crown, Filter, Search, Loader2, Calendar,
  Settings, Mail, Key, KeyRound, Download, FileSpreadsheet, ShieldCheck, RefreshCw,
} from 'lucide-react';

const sb = supabase as any;
const COLORS = ['#FC5647', '#F5A623', '#0EA5A0', '#7CB69D', '#1A1F36', '#9b51e0'];

export default function AdminSeedFundVotes() {
  const [comps, setComps] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [votes, setVotes] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Grow Women Seed Fund');
  const [newEdition, setNewEdition] = useState(new Date().getFullYear().toString());
  const [newDate, setNewDate] = useState('');

  const [addCandOpen, setAddCandOpen] = useState(false);
  const [pickEntId, setPickEntId] = useState('');
  const [raising, setRaising] = useState('');

  const [generateCount, setGenerateCount] = useState(100);
  const [generating, setGenerating] = useState(false);

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
    const [{ data: cands }, { data: tally }, { data: vs }, { data: log }, { data: pc }] = await Promise.all([
      sb.from('seed_fund_candidates')
        .select('id, raising_for, display_order, entrepreneur:entrepreneurs(id,name,business_name,country,sector,photo_url,gender,status)')
        .eq('competition_id', id).order('display_order'),
      sb.rpc('get_seed_fund_vote_counts', { _competition_id: id }),
      sb.from('seed_fund_votes').select('*').eq('competition_id', id).order('created_at', { ascending: false }),
      sb.from('seed_fund_audit_log').select('*').eq('competition_id', id).order('submitted_at', { ascending: false }),
      sb.from('seed_fund_promo_codes').select('*').eq('competition_id', id).order('created_at', { ascending: false }),
    ]);
    setCandidates(cands || []);
    const map: Record<string, number> = {};
    (tally || []).forEach((r: any) => { map[r.candidate_id] = Number(r.votes || 0); });
    setCounts(map);
    setVotes(vs || []);
    setAudit(log || []);
    setPromoCodes(pc || []);
  };

  useEffect(() => { reload(); }, []);

  // Realtime votes + audit
  useEffect(() => {
    if (!active?.id) return;
    const ch = sb.channel(`seed-${active.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seed_fund_votes', filter: `competition_id=eq.${active.id}` },
        () => loadCompetition(active.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seed_fund_audit_log', filter: `competition_id=eq.${active.id}` },
        () => loadCompetition(active.id))
      .subscribe();
    return () => { sb.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  const totalVotes = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const totalBallots = audit.length;
  const ranked = useMemo(() =>
    candidates.map(c => ({ ...c, v: counts[c.id] || 0 })).sort((a, b) => b.v - a.v),
    [candidates, counts]);
  const winner = ranked[0];
  const chartData = ranked.map(c => ({ name: c.entrepreneur?.name?.split(' ')[0] || '—', votes: c.v }));

  const filteredAudit = audit.filter(v =>
    !filter ||
    v.voter_email.toLowerCase().includes(filter.toLowerCase()) ||
    (v.voter_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (v.vote_token || '').toLowerCase().includes(filter.toLowerCase())
  );

  const createComp = async () => {
    if (!newTitle) return;
    const { data, error } = await sb.from('seed_fund_competitions').insert({
      title: newTitle, edition: newEdition || null,
      event_date: newDate ? new Date(newDate).toISOString() : null,
      status: 'draft', auth_method: 'otp', max_selections: 1,
    }).select().single();
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Competition created' });
    setNewOpen(false); setActive(data); await reload();
  };

  const updateActive = async (patch: any) => {
    if (!active) return;
    const { data, error } = await sb.from('seed_fund_competitions')
      .update(patch).eq('id', active.id).select().single();
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setActive(data);
    setComps(prev => prev.map(c => c.id === data.id ? data : c));
  };

  const setStatus = (status: string) => updateActive({ status }).then(() =>
    toast({ title: `Competition ${status}` }));

  const addCandidate = async () => {
    if (!active || !pickEntId) return;
    const { error } = await sb.from('seed_fund_candidates').insert({
      competition_id: active.id, entrepreneur_id: pickEntId,
      raising_for: raising || null, display_order: candidates.length,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
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

  // ---- Promo codes ----
  const generateCodes = async () => {
    if (!active) return;
    setGenerating(true);
    const { data, error } = await sb.functions.invoke('generate-promo-codes', {
      body: { competition_id: active.id, count: generateCount },
    });
    setGenerating(false);
    if (error || data?.error) {
      toast({ title: 'Error', description: data?.error || error?.message, variant: 'destructive' });
      return;
    }
    const codes: string[] = data.codes || [];
    // Download CSV immediately
    const csv = 'Code\n' + codes.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `promo-codes-${active.edition || active.id}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Generated ${codes.length} codes`, description: 'Downloaded as CSV.' });
    await loadCompetition(active.id);
  };

  // ---- Exports ----
  const exportResults = (format: 'csv' | 'xlsx') => {
    if (!active) return;
    const tally = ranked.map((c, i) => ({
      Rank: i + 1,
      Candidate: c.entrepreneur?.name,
      Business: c.entrepreneur?.business_name,
      Country: c.entrepreneur?.country,
      Sector: c.entrepreneur?.sector,
      Votes: c.v,
      'Share %': totalVotes ? +((c.v / totalVotes) * 100).toFixed(2) : 0,
    }));
    const auditRows = audit.map(a => ({
      'Submitted At': new Date(a.submitted_at).toISOString(),
      'Voter Email': a.voter_email,
      'Voter Name': a.voter_name || '',
      'Auth Method': a.auth_method,
      'Vote Token': a.vote_token,
      Candidates: (a.candidate_ids || []).map((cid: string) =>
        candidates.find(c => c.id === cid)?.entrepreneur?.name).filter(Boolean).join(' | '),
      IP: a.voter_ip || '',
    }));

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tally), 'Results');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(auditRows), 'Audit Log');
      XLSX.writeFile(wb, `seed-fund-${active.edition || active.id}.xlsx`);
    } else {
      const csv = (rows: any[]) => {
        if (!rows.length) return '';
        const keys = Object.keys(rows[0]);
        return keys.join(',') + '\n' + rows.map(r => keys.map(k =>
          `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      };
      const text = `RESULTS\n${csv(tally)}\n\nAUDIT LOG\n${csv(auditRows)}`;
      const blob = new Blob([text], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `seed-fund-${active.edition || active.id}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  const authMethodLabel: Record<string, string> = {
    otp: 'Email OTP',
    private_code: 'Private one-time codes',
    public_code: 'Single shared code',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Seed Fund Voting</h1>
          <p className="text-muted-foreground">Configure auth, manage candidates, monitor live results and audit log.</p>
        </div>
        <div className="flex gap-2">
          <Select value={active?.id || ''} onValueChange={(v) => { const c = comps.find(x => x.id === v); setActive(c); loadCompetition(v); }}>
            <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select a competition" /></SelectTrigger>
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
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
              {active.event_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(active.event_date).toLocaleDateString()}</span>}
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{authMethodLabel[active.auth_method] || active.auth_method}</span>
              <span>Max selections: <strong>{active.max_selections}</strong></span>
            </div>
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
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" />Auth & Rules</TabsTrigger>
            <TabsTrigger value="candidates">Candidates ({candidates.length})</TabsTrigger>
            <TabsTrigger value="codes">Promo Codes ({promoCodes.length})</TabsTrigger>
            <TabsTrigger value="audit">Audit Log ({audit.length})</TabsTrigger>
          </TabsList>

          {/* ============ OVERVIEW ============ */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid sm:grid-cols-4 gap-4">
              <Stat icon={Users} label="Candidates" value={candidates.length} />
              <Stat icon={Vote} label="Total Votes" value={totalVotes} sub={`${totalBallots} ballot${totalBallots === 1 ? '' : 's'}`} />
              <Stat icon={ShieldCheck} label="Auth Method" value={authMethodLabel[active.auth_method]?.split(' ')[0] || ''} sub={`Max ${active.max_selections} pick${active.max_selections === 1 ? '' : 's'}`} />
              <Stat icon={Trophy} label="Leader" value={winner?.entrepreneur?.name?.split(' ')[0] || '—'} sub={winner ? `${winner.v} votes` : ''} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => exportResults('xlsx')} variant="outline"><FileSpreadsheet className="h-4 w-4 mr-1" /> Export Excel</Button>
              <Button onClick={() => exportResults('csv')} variant="outline"><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
              <Button onClick={() => loadCompetition(active.id)} variant="ghost"><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
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
              <CardHeader><CardTitle>Live Leaderboard</CardTitle></CardHeader>
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

          {/* ============ SETTINGS ============ */}
          <TabsContent value="settings" className="space-y-6 mt-4">
            <Card>
              <CardHeader><CardTitle>Voter authentication</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <RadioGroup
                  value={active.auth_method}
                  onValueChange={(v) => updateActive({ auth_method: v })}
                  className="grid sm:grid-cols-3 gap-3"
                >
                  {[
                    { v: 'otp', icon: Mail, label: 'Email OTP', desc: 'Voter enters email, receives a 6-digit code.' },
                    { v: 'private_code', icon: KeyRound, label: 'Private codes', desc: 'Unique one-time codes distributed to each voter.' },
                    { v: 'public_code', icon: Key, label: 'Public code', desc: 'A single shared code for all voters.' },
                  ].map(opt => (
                    <label key={opt.v} className={`cursor-pointer flex flex-col gap-2 p-4 rounded-xl border-2 transition-all ${
                      active.auth_method === opt.v ? 'border-grow-coral bg-grow-coral/5' : 'border-border hover:border-grow-coral/40'
                    }`}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={opt.v} id={opt.v} />
                        <opt.icon className="h-4 w-4 text-grow-coral" />
                        <span className="font-semibold">{opt.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">{opt.desc}</p>
                    </label>
                  ))}
                </RadioGroup>

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <Label className="text-sm">Max selections per voter</Label>
                    <Input type="number" min={1} max={20} value={active.max_selections}
                      onChange={e => updateActive({ max_selections: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Voters must select exactly this many candidates. Each selection counts as 1 vote.</p>
                  </div>
                  {active.auth_method === 'public_code' && (
                    <div>
                      <Label className="text-sm">Shared public code</Label>
                      <Input value={active.public_code || ''}
                        onChange={e => updateActive({ public_code: e.target.value.toUpperCase() })}
                        placeholder="e.g. GROW2026"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Share this code with everyone you want to allow to vote.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ CANDIDATES ============ */}
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

          {/* ============ PROMO CODES ============ */}
          <TabsContent value="codes" className="space-y-4 mt-4">
            {active.auth_method !== 'private_code' ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">
                Promo codes are used only when the auth method is <strong>Private codes</strong>.
                Switch to that method in <em>Auth & Rules</em> to manage them.
              </CardContent></Card>
            ) : (
              <>
                <Card>
                  <CardHeader><CardTitle>Generate one-time codes</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[160px]">
                      <Label>How many?</Label>
                      <Input type="number" min={1} max={5000} value={generateCount}
                        onChange={e => setGenerateCount(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))} />
                    </div>
                    <Button onClick={generateCodes} disabled={generating}>
                      {generating ? <Loader2 className="animate-spin" /> : <KeyRound />} Generate & download CSV
                    </Button>
                  </CardContent>
                </Card>

                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left">
                      <tr><th className="p-3">Code</th><th className="p-3">Used by</th><th className="p-3">Used at</th></tr>
                    </thead>
                    <tbody>
                      {promoCodes.slice(0, 200).map(pc => (
                        <tr key={pc.id} className="border-t border-border">
                          <td className="p-3 font-mono">{pc.code}</td>
                          <td className="p-3">{pc.used_by_email || <span className="text-muted-foreground italic">—</span>}</td>
                          <td className="p-3 text-muted-foreground">{pc.used_at ? new Date(pc.used_at).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                      {promoCodes.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No codes generated yet.</td></tr>}
                    </tbody>
                  </table>
                  {promoCodes.length > 200 && <div className="p-3 text-xs text-muted-foreground text-center">Showing first 200 — export Excel to see all.</div>}
                </div>
              </>
            )}
          </TabsContent>

          {/* ============ AUDIT LOG ============ */}
          <TabsContent value="audit" className="space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by email, name or token" className="pl-9" />
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{filteredAudit.length} / {audit.length}</span>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-3">When</th>
                    <th className="p-3">Voter</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Selections</th>
                    <th className="p-3">Token</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.map(a => {
                    const selectedNames = (a.candidate_ids || []).map((cid: string) =>
                      candidates.find(c => c.id === cid)?.entrepreneur?.name).filter(Boolean);
                    return (
                      <tr key={a.id} className="border-t border-border align-top">
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(a.submitted_at).toLocaleString()}</td>
                        <td className="p-3">
                          <div className="font-medium">{a.voter_name || '—'}</div>
                          <div className="text-xs font-mono text-muted-foreground">{a.voter_email}</div>
                        </td>
                        <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted">{a.auth_method}</span></td>
                        <td className="p-3 text-xs">{selectedNames.join(', ') || '—'}</td>
                        <td className="p-3 text-xs font-mono text-muted-foreground">{(a.vote_token || '').slice(0, 8)}…</td>
                      </tr>
                    );
                  })}
                  {filteredAudit.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No ballots yet.</td></tr>}
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
            <div><Label>Title</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
            <div><Label>Edition</Label><Input value={newEdition} onChange={e => setNewEdition(e.target.value)} placeholder="2026" /></div>
            <div><Label>Event date</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
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
            <div><Label>Raising money for</Label><Input value={raising} onChange={e => setRaising(e.target.value)} placeholder="e.g. Expand production capacity" /></div>
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
      <div className="min-w-0">
        <div className="text-xs uppercase text-muted-foreground tracking-widest">{label}</div>
        <div className="text-2xl font-bold truncate">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </CardContent></Card>
  );
}
