import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Eligibility check state
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; type?: string; name?: string; reason?: string } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/admin" replace />;

  const checkEligibility = async () => {
    if (!email) return;
    setCheckingEligibility(true);
    setEligibility(null);
    setError('');
    try {
      const { data, error } = await supabase.rpc('check_signup_eligibility', { check_email: email });
      if (error) {
        setError(error.message);
      } else {
        const result = data as unknown as { eligible: boolean; type?: string; name?: string; reason?: string };
        setEligibility(result);
        if (result?.name && !fullName) setFullName(result.name);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setCheckingEligibility(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        // Must check eligibility first
        if (!eligibility?.eligible) {
          setError('Please check your eligibility first.');
          setSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setSignUpSuccess(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (signUpSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-3">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to <strong>{email}</strong>. Please click it to activate your account.
          </p>
          <Button variant="outline" onClick={() => { setSignUpSuccess(false); setIsLogin(true); }}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">G</span>
          </div>
          <h1 className="text-2xl font-display font-bold">
            {isLogin ? 'Dashboard Login' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Sign in to access your dashboard' : 'Register with your application email'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEligibility(null); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Eligibility check for signup */}
          {!isLogin && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!email || checkingEligibility}
                onClick={checkEligibility}
              >
                {checkingEligibility ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Check Eligibility
              </Button>

              {eligibility && (
                <div className={`flex items-start gap-3 p-3 rounded-xl text-sm ${eligibility.eligible ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                  {eligibility.eligible ? <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                  <div>
                    {eligibility.eligible ? (
                      <p>Welcome, <strong>{eligibility.name}</strong>! You're eligible as a <strong>{eligibility.type}</strong>. Please set your password below.</p>
                    ) : (
                      <p>{eligibility.reason}</p>
                    )}
                  </div>
                </div>
              )}

              {eligibility?.eligible && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || (!isLogin && !eligibility?.eligible)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setEligibility(null); }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
