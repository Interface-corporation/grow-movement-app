import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Save, User, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: '', email: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          avatar_url: data.avatar_url || '',
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB.');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = urlData.publicUrl + '?t=' + Date.now();

    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('user_id', user.id);
    setProfile({ ...profile, avatar_url: avatarUrl });
    toast.success('Profile picture updated!');
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url || null,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Error saving profile: ' + error.message);
    } else {
      toast.success('Profile updated successfully!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">My Profile</h2>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        {/* Avatar with Upload */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="font-bold text-foreground">{profile.full_name || 'No name set'}</p>
            <p className="text-sm text-muted-foreground">{profile.email || user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">Hover avatar to change photo</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name</label>
          <input
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            value={profile.email || user?.email || ''}
            disabled
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-muted-foreground text-sm cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Profile
        </Button>
      </div>
    </div>
  );
}
