import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { sectors, countries, stages } from '@/data/mockEntrepreneurs';
import FileUpload from '@/components/FileUpload';
import { toast } from 'sonner';

const communicationOptions = ['Email', 'WhatsApp', 'Phone Call', 'SMS', 'Zoom/Video Call'];

const emptyForm = {
  name: '', business_name: '', country: '', sector: '', stage: '',
  gender: '', email: '', phone: '', preferred_communication: '',
  pitch_summary: '', business_description: '', video_url: '',
  next_of_kin: '', education_background: '', about_entrepreneur: '',
  funding_needs: '', coaching_needs: '', revenue: '',
  year_founded: '', team_size: '', website: '', linkedin: '',
  photo_url: '', pitch_deck_url: '',
};

export default function Apply() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ['Personal Info', 'Contact', 'Business Details'];

  const handleSubmit = async () => {
    if (!form.name || !form.business_name || !form.country || !form.sector || !form.stage || !form.gender || !form.email) {
      setError('Please fill in all required fields (marked with *).');
      setActiveTab(0); // Go back to first tab if required fields missing
      return;
    }
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      setActiveTab(1);
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const { error: dbError } = await supabase.from('entrepreneurs').insert({
        name: form.name.trim(),
        business_name: form.business_name.trim(),
        country: form.country,
        sector: form.sector,
        stage: form.stage,
        gender: form.gender,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        preferred_communication: form.preferred_communication || null,
        pitch_summary: form.pitch_summary.trim() || null,
        business_description: form.business_description.trim() || null,
        video_url: form.video_url.trim() || null,
        photo_url: form.photo_url || null,
        next_of_kin: form.next_of_kin.trim() || null,
        education_background: form.education_background.trim() || null,
        about_entrepreneur: form.about_entrepreneur.trim() || null,
        funding_needs: form.funding_needs.trim() || null,
        coaching_needs: form.coaching_needs.trim() || null,
        revenue: form.revenue.trim() || null,
        year_founded: form.year_founded ? parseInt(form.year_founded) : null,
        team_size: form.team_size ? parseInt(form.team_size) : null,
        website: form.website.trim() || null,
        linkedin: form.linkedin.trim() || null,
        status: 'Pending',
        pitch_deck_url: form.pitch_deck_url || null,
      });

      if (dbError) {
        if (dbError.message?.includes('duplicate') || dbError.message?.includes('unique')) {
          setError('An application with this email already exists.');
        } else {
          setError('Failed to submit application. Please try again.');
        }
        toast.error('Submission failed');
      } else {
        setSubmitted(true);
        toast.success('Application submitted successfully!');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20 max-w-lg">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Application Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to the Grow Movement program! Our team will review your application
            and get back to you within 5-7 business days.
          </p>
          <Link to="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const f = (key: string, placeholder: string, type = 'text') => (
    <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
      placeholder={placeholder} type={type}
      className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
  );
  const ta = (key: string, placeholder: string, rows = 3) => (
    <textarea value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
      placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
  );

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Apply to Grow Movement</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join our program and connect with coaches, mentors, and investors who can help you grow your business.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {f('name', 'Full Name *')}
              {f('business_name', 'Business Name *')}
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm">
                <option value="">Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
              </select>
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm">
                <option value="">Country *</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm">
                <option value="">Sector *</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm">
                <option value="">Stage *</option>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {f('education_background', 'Education Background')}
              {f('video_url', 'Video URL (YouTube or other)')}
              <div className="sm:col-span-2">
                <FileUpload bucket="profile-photos" accept="image/*" label="Profile Photo" currentUrl={form.photo_url}
                  onUpload={(url) => setForm({ ...form, photo_url: url })} onRemove={() => setForm({ ...form, photo_url: '' })} />
              </div>
              <div className="sm:col-span-2">{ta('about_entrepreneur', 'Tell us about yourself and your journey')}</div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {f('email', 'Email Address *', 'email')}
              {f('phone', 'Phone Number')}
              <select value={form.preferred_communication} onChange={e => setForm({ ...form, preferred_communication: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm">
                <option value="">Preferred Communication</option>
                {communicationOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {f('linkedin', 'LinkedIn Profile URL')}
              {f('website', 'Website / Online Presence')}
              {f('next_of_kin', 'Next of Kin (Name & Contact)')}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {f('revenue', 'Revenue (e.g. $50,000/year)')}
                {f('year_founded', 'Year Founded', 'number')}
                {f('team_size', 'Total Team Size', 'number')}
              </div>
              {ta('pitch_summary', 'Pitch Summary — Explain your business in 2-3 sentences')}
              {ta('business_description', 'Describe your business model and what you do')}
              {ta('funding_needs', 'What funding do you need and for what?')}
              {ta('coaching_needs', 'What coaching or mentoring support do you need?')}
              <FileUpload bucket="pitch-decks" accept=".pdf" maxSizeMB={5} label="Pitch Deck (PDF, max 5MB)" currentUrl={form.pitch_deck_url}
                onUpload={(url) => setForm({ ...form, pitch_deck_url: url })} onRemove={() => setForm({ ...form, pitch_deck_url: '' })} />
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm bg-destructive/10 text-destructive p-3 rounded-lg">{error}</div>
          )}

          <div className="flex gap-3 mt-6">
            {activeTab > 0 && (
              <Button variant="outline" onClick={() => setActiveTab(activeTab - 1)} className="flex-1">Previous</Button>
            )}
            {activeTab < tabs.length - 1 ? (
              <Button onClick={() => setActiveTab(activeTab + 1)} className="flex-1 bg-primary text-primary-foreground">Next</Button>
            ) : (
              <Button onClick={handleSubmit}
                disabled={submitting || !form.name || !form.business_name || !form.country || !form.sector || !form.stage || !form.gender || !form.email}
                className="flex-1 bg-primary text-primary-foreground">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
