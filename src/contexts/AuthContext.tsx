import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'staff' | 'program_admin' | 'coach' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: UserRole;
  programId: string | null; // for program_admin
  coachId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);

  const fetchRoleInfo = async (userId: string) => {
    // Get role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role, program_id')
      .eq('user_id', userId);

    if (roles && roles.length > 0) {
      // Priority: admin > program_admin > coach
      const adminRole = roles.find(r => r.role === 'admin' || r.role === 'staff');
      const paRole = roles.find(r => r.role === 'program_admin');
      const coachRole = roles.find(r => r.role === 'coach');

      if (adminRole) {
        setUserRole('admin');
        setIsAdmin(true);
      } else if (paRole) {
        setUserRole('program_admin');
        setProgramId(paRole.program_id);
        setIsAdmin(false);
      } else if (coachRole) {
        setUserRole('coach');
        setIsAdmin(false);
      }
    } else {
      setUserRole(null);
      setIsAdmin(false);
    }

    // Get coach_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('coach_id')
      .eq('user_id', userId)
      .maybeSingle();
    setCoachId(profile?.coach_id || null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchRoleInfo(session.user.id), 0);
        } else {
          setIsAdmin(false);
          setUserRole(null);
          setProgramId(null);
          setCoachId(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoleInfo(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, userRole, programId, coachId, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
