import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { sectors, countries, stages } from '@/data/mockEntrepreneurs';
import { EntrepreneurCard } from '@/components/EntrepreneurCard';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function Entrepreneurs() {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { items } = useCart();
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntrepreneurs = async () => {
      // Only show Admitted and Alumni entrepreneurs
      const { data: entData } = await supabase.from('entrepreneurs').select('*')
        .in('status', ['Admitted', 'Alumni'])
        .order('created_at', { ascending: false });
      
      setEntrepreneurs(entData || []);
      setLoading(false);
    };
    fetchEntrepreneurs();
  }, []);

  // Map DB rows to the shape EntrepreneurCard expects
  const mappedEntrepreneurs = useMemo(() => {
    return entrepreneurs.map(e => ({
      id: e.id,
      name: e.name,
      photo: e.photo_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
      businessName: e.business_name,
      country: e.country,
      sector: e.sector,
      stage: e.stage,
      gender: e.gender,
      pitchSummary: e.pitch_summary || '',
      businessDescription: e.business_description || '',
      fundingNeeds: e.funding_needs || '',
      coachingNeeds: e.coaching_needs || '',
      revenue: e.revenue || '',
      yearFounded: e.year_founded || 0,
      teamSize: e.team_size || 0,
      status: e.status as 'Pending' | 'Admitted' | 'Matched' | 'Alumni' | 'Rejected',
    }));
  }, [entrepreneurs]);

  const filteredEntrepreneurs = useMemo(() => {
    return mappedEntrepreneurs.filter(e => {
      const matchesSearch = search === '' || 
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.businessName.toLowerCase().includes(search.toLowerCase()) ||
        e.pitchSummary.toLowerCase().includes(search.toLowerCase());
      const matchesSector = !selectedSector || e.sector === selectedSector;
      const matchesCountry = !selectedCountry || e.country === selectedCountry;
      const matchesStage = !selectedStage || e.stage === selectedStage;
      const matchesGender = !selectedGender || e.gender === selectedGender;
      return matchesSearch && matchesSector && matchesCountry && matchesStage && matchesGender;
    });
  }, [mappedEntrepreneurs, search, selectedSector, selectedCountry, selectedStage, selectedGender]);

  const hasActiveFilters = selectedSector || selectedCountry || selectedStage || selectedGender;

  const clearFilters = () => {
    setSelectedSector('');
    setSelectedCountry('');
    setSelectedStage('');
    setSelectedGender('');
    setSearch('');
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Our Entrepreneurs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover talented entrepreneurs in training and alumni ready for coaching, 
            mentorship, or investment opportunities.
          </p>
          {items.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
              {items.length}/3 entrepreneurs selected
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, business, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
            </Button>
          </div>

          {showFilters && (
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">All Sectors</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">All Countries</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">All Stages</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
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
          Showing {filteredEntrepreneurs.length} of {mappedEntrepreneurs.length} entrepreneurs
        </div>

        {filteredEntrepreneurs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEntrepreneurs.map(entrepreneur => (
              <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} />
            ))}
          </div>
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
