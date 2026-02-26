import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Shield } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">Settings</h2>

      {/* Change Password */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Change Password</h3>
            <p className="text-sm text-muted-foreground">Update your account password</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        {message && (
          <div className={`text-sm rounded-lg p-3 ${message.includes('Error') || message.includes('match') || message.includes('must') ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
            {message}
          </div>
        )}

        <Button onClick={handleChangePassword} disabled={saving || !newPassword || !confirmPassword} className="bg-primary text-primary-foreground">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
          Update Password
        </Button>
      </div>

      {/* Account Info */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Account Information</h3>
            <p className="text-sm text-muted-foreground">Your account details</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-secondary/50 rounded-xl">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between p-3 bg-secondary/50 rounded-xl">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs">{user?.id?.substring(0, 16)}...</span>
          </div>
          <div className="flex justify-between p-3 bg-secondary/50 rounded-xl">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
