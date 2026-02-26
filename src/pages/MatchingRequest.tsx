import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function MatchingRequest() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: 'coach' as 'coach' | 'investor',
    reason: '',
    support: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coachVerifyError, setCoachVerifyError] = useState('');

  const sortedItems = [...items].sort((a, b) => a.priority - b.priority);

  if (items.length === 0 && !submitted) {
    navigate('/cart');
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.organization.trim()) newErrors.organization = 'Organization is required';
    if (!formData.reason.trim()) newErrors.reason = 'Please explain why you selected these entrepreneurs';
    if (!formData.support.trim()) newErrors.support = 'Please describe what support you can offer';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    setCoachVerifyError('');

    // Verify email belongs to an accepted/unmatched coach
    const { data: coachData } = await supabase
      .from('coaches')
      .select('id, status')
      .eq('email', formData.email.trim().toLowerCase())
      .in('status', ['Accepted', 'Unmatched'])
      .limit(1);

    if (!coachData || coachData.length === 0) {
      setCoachVerifyError('This email is not registered as an accepted coach. Only verified coaches can submit matching requests.');
      setSubmitting(false);
      return;
    }
    
    const entrepreneurSelections = sortedItems.map(item => ({
      entrepreneur_id: item.entrepreneur.id,
      name: item.entrepreneur.name,
      business_name: item.entrepreneur.businessName,
      priority: item.priority,
    }));

    const { error } = await supabase.from('matching_requests').insert({
      requester_name: formData.name,
      requester_email: formData.email,
      requester_organization: formData.organization,
      requester_role: formData.role,
      message: formData.reason,
      support_description: formData.support,
      entrepreneur_selections: entrepreneurSelections,
    });

    setSubmitting(false);
    
    if (!error) {
      setSubmitted(true);
      clearCart();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
    if (field === 'email') setCoachVerifyError('');
  };

  if (submitted) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20 max-w-lg">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Request Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your interest! The Grow Movement team will review your 
            matching request and get back to you within 2-3 business days.
          </p>
          <Link to="/entrepreneurs">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Browse More Entrepreneurs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Selection
        </Link>

        <h1 className="text-3xl font-display font-bold mb-2">Submit Matching Request</h1>
        <p className="text-muted-foreground mb-8">Tell us about yourself and why you'd like to connect with these entrepreneurs.</p>

        <div className="bg-card rounded-xl border border-border p-4 mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Your Selection (by priority)</h3>
          <div className="space-y-2">
            {sortedItems.map(item => (
              <div key={item.entrepreneur.id} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">{item.priority}</span>
                <img src={item.entrepreneur.photo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                <div>
                  <span className="text-sm font-medium">{item.entrepreneur.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{item.entrepreneur.businessName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {coachVerifyError && (
          <div className="mb-6 flex items-start gap-3 bg-destructive/10 text-destructive p-4 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Coach Verification Failed</p>
              <p>{coachVerifyError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name *</label>
              <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors.name ? 'border-destructive' : 'border-border'}`}
                placeholder="Your full name" maxLength={100} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email * <span className="text-xs text-muted-foreground">(must match your coach registration)</span></label>
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors.email ? 'border-destructive' : 'border-border'}`}
                placeholder="your@email.com" maxLength={255} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Organization *</label>
              <input type="text" value={formData.organization} onChange={(e) => handleChange('organization', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors.organization ? 'border-destructive' : 'border-border'}`}
                placeholder="Company or organization" maxLength={100} />
              {errors.organization && <p className="text-xs text-destructive mt-1">{errors.organization}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Your Role *</label>
              <select value={formData.role} onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                <option value="coach">Coach / Mentor</option>
                <option value="investor">Investor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Why did you select these entrepreneurs? *</label>
            <textarea value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none ${errors.reason ? 'border-destructive' : 'border-border'}`}
              rows={4} placeholder="Explain what attracted you to these entrepreneurs..." maxLength={1000} />
            {errors.reason && <p className="text-xs text-destructive mt-1">{errors.reason}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">What support can you offer? *</label>
            <textarea value={formData.support} onChange={(e) => handleChange('support', e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none ${errors.support ? 'border-destructive' : 'border-border'}`}
              rows={4} placeholder="Describe the mentoring, coaching, or investment support you can provide..." maxLength={1000} />
            {errors.support && <p className="text-xs text-destructive mt-1">{errors.support}</p>}
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-base font-semibold" size="lg">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit Matching Request
          </Button>
        </form>
      </div>
    </div>
  );
}
