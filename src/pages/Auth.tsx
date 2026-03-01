import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold mb-3">Check Your Email</h2>
        <p className="text-muted-foreground text-sm mb-6">
          We've sent a password reset link to <strong>{email}</strong>.
        </p>
        <Button variant="outline" onClick={onBack}>Back to Login</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Reset Password</h2>
      <p className="text-sm text-muted-foreground text-center">Enter your email to receive a reset link.</p>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="your@email.com" required />
      </div>
      <Button type="submit" disabled={submitting || !email} className="w-full bg-primary text-primary-foreground">
        {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Send Reset Link
      </Button>
      <button type="button" onClick={onBack} className="w-full text-sm text-muted-foreground hover:text-foreground">
        Back to Login
      </button>
    </form>
  );
}

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) { toast.error(error.message); } else { setDone(true); toast.success('Password updated!'); }
  };

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-3">Password Updated</h2>
        <p className="text-sm text-muted-foreground mb-6">You can now sign in with your new password.</p>
        <a href="/auth"><Button className="bg-primary text-primary-foreground">Go to Login</Button></a>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Set New Password</h2>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="New password" required minLength={6} />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Confirm new password" required minLength={6} />
      </div>
      <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground">
        {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Update Password
      </Button>
    </form>
  );
}

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Eligibility check state
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; type?: string; name?: string; reason?: string } | null>(null);

  const isRecovery = searchParams.get('type') === 'recovery';

  // Handle email confirmation callback
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'signup' || type === 'email_change') {
      toast.success('Email verified successfully! You can now sign in.');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !isRecovery) return <Navigate to="/admin" replace />;

  // Password recovery flow
  if (isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">G</span>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    );
  }

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
        if (error) {
          if (error.message?.includes('Email not confirmed')) {
            setError('Please verify your email before signing in. Check your inbox for the confirmation link.');
          } else {
            setError(error.message);
          }
        }
      } else {
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
          <h1 className="text-2xl font-display font-bold mb-3">Verify Your Email</h1>
          <p className="text-muted-foreground mb-4">
            We've sent a verification link to <strong>{email}</strong>. 
          </p>
          <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p>Please click the link in the email to verify your account before signing in. Check your spam folder if you don't see it.</p>
          </div>
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

        <div className="bg-card rounded-2xl border border-border p-6">
          {showForgot ? (
            <ForgotPasswordForm onBack={() => setShowForgot(false)} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setEligibility(null); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="your@email.com" required />
                </div>
              </div>

              {!isLogin && (
                <>
                  <Button type="button" variant="outline" className="w-full" disabled={!email || checkingEligibility} onClick={checkEligibility}>
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
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Your name" required />
                      </div>
                    </div>
                  )}
                </>
              )}

              {(isLogin || eligibility?.eligible) && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="••••••••" required minLength={6} />
                  </div>
                  {isLogin && (
                    <button type="button" onClick={() => setShowForgot(true)}
                      className="text-xs text-primary hover:underline mt-1.5 block text-right">
                      Forgot password?
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" disabled={submitting || (!isLogin && !eligibility?.eligible)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setEligibility(null); }}
                  className="text-primary font-medium hover:underline">
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
