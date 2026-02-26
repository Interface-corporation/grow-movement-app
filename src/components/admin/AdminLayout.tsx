import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, UserPlus, GitMerge, Handshake, FileText,
  Clock, LogOut, Menu, X, Loader2, User, Settings, ChevronDown,
  FolderKanban, BookOpen, Shield, ChevronRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SidebarLink {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
  roles: UserRole[]; // which roles can see this
}

const sidebarLinks: SidebarLink[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, roles: ['admin', 'program_admin', 'coach'] },
  { to: '/admin/applications', icon: Users, label: 'Applications', roles: ['admin'] },
  { to: '/admin/entrepreneurs', icon: UserPlus, label: 'Entrepreneurs', roles: ['admin'] },
  { to: '/admin/coaches', icon: UserPlus, label: 'Coaches', roles: ['admin'] },
  { to: '/admin/matching-requests', icon: GitMerge, label: 'Matching Requests', roles: ['admin'] },
  { to: '/admin/my-requests', icon: GitMerge, label: 'My Requests', roles: ['coach'] },
  { to: '/admin/matching', icon: Handshake, label: 'Matching', roles: ['admin', 'program_admin', 'coach'] },
  { to: '/admin/programs', icon: FolderKanban, label: 'Programs', roles: ['admin'] },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projects', roles: ['admin', 'program_admin', 'coach'] },
  { to: '/admin/resources', icon: BookOpen, label: 'Resource Library', roles: ['admin', 'program_admin', 'coach'] },
  { to: '/admin/blog', icon: FileText, label: 'Blog Posts', roles: ['admin'] },
  { to: '/admin/users', icon: Shield, label: 'User Management', roles: ['admin'] },
  { to: '/admin/history', icon: Clock, label: 'Activity Log', roles: ['admin'] },
];

export default function AdminLayout() {
  const { user, loading, userRole, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data);
  };

  useEffect(() => { fetchProfile(); }, [user]);
  useEffect(() => {
    if (location.pathname === '/admin' || !location.pathname.includes('/profile')) fetchProfile();
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Filter links by role
  const visibleLinks = sidebarLinks.filter(link => {
    if (!userRole) return false;
    return link.roles.includes(userRole);
  });

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const roleBadge = userRole === 'admin' ? 'Admin' : userRole === 'program_admin' ? 'Program Admin' : userRole === 'coach' ? 'Coach' : '';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-display text-lg font-bold text-foreground">Grow</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {visibleLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to, link.end)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 mb-2">
            <span className="text-xs text-muted-foreground truncate flex-1">{user.email}</span>
            {roleBadge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                {roleBadge}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {visibleLinks.find(l => isActive(l.to, l.end))?.label ||
                (location.pathname.includes('/profile') ? 'Profile' :
                  location.pathname.includes('/settings') ? 'Settings' : 'Dashboard')}
            </h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary">{initials}</span>
                )}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">{displayName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Link to="/admin/profile" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <Link to="/admin/settings" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <div className="border-t border-border mt-1">
                  <button onClick={() => { setProfileOpen(false); signOut(); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors w-full text-left">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
