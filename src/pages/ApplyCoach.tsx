import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { countries } from '@/data/mockEntrepreneurs';
import { toast } from 'sonner';

const communicationOptions = ['Email', 'WhatsApp', 'Phone Call', 'SMS', 'Zoom/Video Call'];

const emptyForm = {
  name: '', email: '', phone: '', organization: '', specialization: '',
  country: '', bio: '', experience: '', availability: '',
  preferred_communication: '', preferred_client_type: '', linkedin: '',
};

export default function ApplyCoach() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      setError('Please fill in all required fields (marked with *).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const { error: dbError } = await supabase.from('coaches').insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        organization: form.organization.trim() || null,
        specialization: form.specialization.trim() || null,
        country: form.country || null,
        bio: form.bio.trim() || null,
        experience: form.experience.trim() || null,
        availability: form.availability.trim() || null,
        preferred_communication: form.preferred_communication || null,
        preferred_client_type: form.preferred_client_type.trim() || null,
        linkedin: form.linkedin.trim() || null,
        status: 'Pending',
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
            Thank you for applying to become a Grow Movement coach! Our team will review your application
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

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Apply as a Coach</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join our program as a coach or mentor and help entrepreneurs grow their businesses across Africa.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {f('name', 'Full Name *')}
            {f('email', 'Email Address *', 'email')}
            {f('phone', 'Phone Number')}
            {f('linkedin', 'LinkedIn Profile URL')}
            {f('organization', 'Organization')}
            {f('specialization', 'Specialization / Areas of Expertise')}
            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm">
              <option value="">Country</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.preferred_communication} onChange={e => setForm({ ...form, preferred_communication: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm">
              <option value="">Preferred Communication</option>
              {communicationOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {f('preferred_client_type', 'Preferred Client Type')}
            {f('availability', 'Availability & Preferred Times')}
          </div>
          <textarea value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
            placeholder="Relevant Experience" rows={3}
            className="w-full mt-4 px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Bio — Tell us about yourself" rows={3}
            className="w-full mt-4 px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />

          {error && (
            <div className="mt-4 text-sm bg-destructive/10 text-destructive p-3 rounded-lg">{error}</div>
          )}

          <Button onClick={handleSubmit}
            disabled={submitting || !form.name || !form.email}
            className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit Coach Application
          </Button>
        </div>
      </div>
    </div>
  );
}
