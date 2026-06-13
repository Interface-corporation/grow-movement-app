import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Loader2, Sparkles, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { sectors, countries, stages } from '@/data/mockEntrepreneurs';
import { EntrepreneurCard } from '@/components/EntrepreneurCard';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getProfilePhoto } from '@/lib/avatars';
import heroImg from '@/assets/growImage/seedHero2.png';

export default function Entrepreneurs() {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { items } = useCart();
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: entData }, { data: progData }] = await Promise.all([
        supabase.from('entrepreneurs').select('*').in('status', ['Admitted', 'Alumni', 'Seed Fund Candidate', 'Seed Fund Alumni']).order('created_at', { ascending: false }),
        supabase.from('programs').select('id, name'),
      ]);
      setEntrepreneurs(entData || []);
      setPrograms(progData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const mappedEntrepreneurs = useMemo(() => {
    return entrepreneurs.map(e => ({
      id: e.id, name: e.name,
      photo: getProfilePhoto(e.photo_url, e.gender),
      businessName: e.business_name, country: e.country, sector: e.sector, stage: e.stage,
      gender: e.gender,
      pitchSummary: e.problem_solving || e.pitch_summary || '',
      businessDescription: e.products_services || e.business_description || '',
      fundingNeeds: e.funding_needs || '', coachingNeeds: e.coaching_needs || '',
      revenue: e.revenue || '', yearFounded: e.year_founded || 0, teamSize: e.team_size || 0,
      status: e.status as any, programId: e.program_id,
    }));
  }, [entrepreneurs]);

  const filteredEntrepreneurs = useMemo(() => {
    return mappedEntrepreneurs.filter(e => {
      const matchesSearch = !search || [e.name, e.businessName, e.pitchSummary, e.businessDescription]
        .some(f => f.toLowerCase().includes(search.toLowerCase()));
      const matchesSector = !selectedSector || e.sector === selectedSector;
      const matchesCountry = !selectedCountry || e.country === selectedCountry;
      const matchesStage = !selectedStage || e.stage === selectedStage;
      const matchesGender = !selectedGender || e.gender === selectedGender;
      const matchesProgram = !selectedProgram || e.programId === selectedProgram;
      return matchesSearch && matchesSector && matchesCountry && matchesStage && matchesGender && matchesProgram;
    });
  }, [mappedEntrepreneurs, search, selectedSector, selectedCountry, selectedStage, selectedGender, selectedProgram]);

  const [showAllCountries, setShowAllCountries] = useState(false);

  const priorityCountries = ['Rwanda', 'Uganda', 'Kenya', 'Malawi', 'Tanzania', 'Nigeria', 'Ghana', 'Ethiopia', 'Ivory Coast', 'India'];

  const entrepreneurCountries = useMemo(() => {
    const unique = new Set(mappedEntrepreneurs.map(e => e.country).filter(Boolean));
    return Array.from(unique).sort();
  }, [mappedEntrepreneurs]);

  const countryOptions = useMemo(() => {
    const prioritySet = new Set(priorityCountries);
    const extraFromEntrepreneurs = entrepreneurCountries.filter(c => !prioritySet.has(c));
    const shortList = [...priorityCountries, ...extraFromEntrepreneurs];
    if (showAllCountries) {
      const shortSet = new Set(shortList);
      const remaining = countries.filter(c => !shortSet.has(c));
      return { priority: priorityCountries, extra: extraFromEntrepreneurs, remaining };
    }
    return { priority: priorityCountries, extra: extraFromEntrepreneurs, remaining: [] as string[] };
  }, [entrepreneurCountries, showAllCountries]);

  const [page, setPage] = useState(1);
  const pageSize = 36;
  const totalPages = Math.max(1, Math.ceil(filteredEntrepreneurs.length / pageSize));
  const pagedList = useMemo(
    () => filteredEntrepreneurs.slice((page - 1) * pageSize, page * pageSize),
    [filteredEntrepreneurs, page]
  );
  useEffect(() => { setPage(1); }, [search, selectedSector, selectedCountry, selectedStage, selectedGender, selectedProgram]);

  const hasActiveFilters = selectedSector || selectedCountry || selectedStage || selectedGender || selectedProgram;

  const clearFilters = () => {
    setSelectedSector(''); setSelectedCountry(''); setSelectedStage(''); setSelectedGender(''); setSelectedProgram(''); setSearch('');
  };

  if (loading) {
    return <div className="pt-24 pb-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-background">
      {/* ============ CINEMATIC HERO ============ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden text-white">
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <motion.img
            src={heroImg}
            alt="Grow Movement entrepreneurs"
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-grow-navy/95 via-grow-navy/75 to-grow-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-grow-navy via-transparent to-transparent" />
        </motion.div>

        <motion.div
          aria-hidden
          className="absolute top-1/4 right-10 w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, var(--grow-coral), transparent 70%)' }}
          animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-12 left-10 w-60 h-60 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, var(--grow-teal), transparent 70%)' }}
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-grow-coral/90 text-white text-[11px] font-bold uppercase tracking-[0.18em] shadow-lg shadow-grow-coral/30">
              
            </span>
            <h1 className="font-display text-grow-cream text-4xl sm:text-5xl md:text-7xl font-black mt-6 leading-[1.05]">
              Meet the founders <br />
              <span className="bg-gradient-to-r from-grow-coral via-grow-gold to-white bg-clip-text text-transparent">
                shaping tomorrow.
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
              Discover talented entrepreneurs in training and alumni from across Africa and Asia —
              ready for coaching, mentorship, and investment opportunities.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-grow-gold" />
                <span><strong className="text-white">{mappedEntrepreneurs.length}</strong> active profiles</span>
              </div>
              <div className="h-4 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-grow-coral" />
                <span>13+ countries</span>
              </div>
              {items.length > 0 && (
                <div className="inline-flex items-center gap-2 bg-grow-gold text-grow-navy rounded-full px-3 py-1.5 text-xs font-bold">
                  {items.length}/3 selected for coaching
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FILTERS + GRID ============ */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search by name, business, or keyword..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
            </Button>
          </div>

          {showFilters && (
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">All Sectors</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={selectedCountry} onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__show_all__') { setShowAllCountries(true); return; }
                  setSelectedCountry(val);
                }} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">All Countries</option>
                  <optgroup label="Priority Countries">
                    {countryOptions.priority.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  {countryOptions.extra.length > 0 && (
                    <optgroup label="Other Active Countries">
                      {countryOptions.extra.map(c => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  )}
                  {showAllCountries ? (
                    countryOptions.remaining.length > 0 && (
                      <optgroup label="All Countries">
                        {countryOptions.remaining.map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                    )
                  ) : (
                    <option value="__show_all__">▾ Show all countries…</option>
                  )}
                </select>
                <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">All Stages</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {programs.length > 0 && (
                  <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                    <option value="">All Programs</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
              {hasActiveFilters && (
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1">
                    <X className="h-3 w-3" /> Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-6 text-sm text-muted-foreground">
          Showing {pagedList.length} of {filteredEntrepreneurs.length} entrepreneurs
          {totalPages > 1 && <span className="ml-1">· page {page} of {totalPages}</span>}
        </div>

        {filteredEntrepreneurs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pagedList.map(entrepreneur => (
                <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button variant="outline" size="sm" disabled={page === 1}
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'}
                    className={p === page ? 'bg-primary text-primary-foreground' : ''}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" disabled={page === totalPages}
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No entrepreneurs found</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
