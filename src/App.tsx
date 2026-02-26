import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { GrowFooter } from '@/components/GrowFooter';
import Home from '@/pages/Home';
import Entrepreneurs from '@/pages/Entrepreneurs';
import EntrepreneurProfile from '@/pages/EntrepreneurProfile';
import Cart from '@/pages/Cart';
import MatchingRequest from '@/pages/MatchingRequest';
import Auth from '@/pages/Auth';
import Apply from '@/pages/Apply';
import ApplyCoach from '@/pages/ApplyCoach';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardHome from '@/pages/admin/DashboardHome';
import AdminApplications from '@/pages/admin/AdminApplications';
import AdminEntrepreneurs from '@/pages/admin/AdminEntrepreneurs';
import AdminCoaches from '@/pages/admin/AdminCoaches';
import AdminMatchingRequests from '@/pages/admin/AdminMatchingRequests';
import AdminMatching from '@/pages/admin/AdminMatching';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminHistory from '@/pages/admin/AdminHistory';
import AdminProfile from '@/pages/admin/AdminProfile';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminPrograms from '@/pages/admin/AdminPrograms';
import AdminProgramDetail from '@/pages/admin/AdminProgramDetail';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminResources from '@/pages/admin/AdminResources';
import AdminUserManagement from '@/pages/admin/AdminUserManagement';
import CoachDashboard from '@/pages/admin/CoachDashboard';
import CoachMatchingRequests from '@/pages/admin/CoachMatchingRequests';
import ProgramAdminDashboard from '@/pages/admin/ProgramAdminDashboard';
import BlogPost from '@/pages/BlogPost';
import Blog from '@/pages/Blog';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/contexts/AuthContext';

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <><Navbar /><main className="min-h-screen bg-background text-foreground">{children}</main><GrowFooter /></>
);

// Role-aware dashboard home
function RoleDashboardHome() {
  const { userRole } = useAuth();
  if (userRole === 'coach') return <CoachDashboard />;
  if (userRole === 'program_admin') return <ProgramAdminDashboard />;
  return <DashboardHome />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/entrepreneurs" element={<PublicLayout><Entrepreneurs /></PublicLayout>} />
            <Route path="/entrepreneurs/:id" element={<PublicLayout><EntrepreneurProfile /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/matching-request" element={<PublicLayout><MatchingRequest /></PublicLayout>} />
            <Route path="/apply" element={<PublicLayout><Apply /></PublicLayout>} />
            <Route path="/apply/coach" element={<PublicLayout><ApplyCoach /></PublicLayout>} />
            <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            {/* Auth */}
            <Route path="/auth" element={<Auth />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<RoleDashboardHome />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="entrepreneurs" element={<AdminEntrepreneurs />} />
              <Route path="coaches" element={<AdminCoaches />} />
              <Route path="matching-requests" element={<AdminMatchingRequests />} />
              <Route path="my-requests" element={<CoachMatchingRequests />} />
              <Route path="matching" element={<AdminMatching />} />
              <Route path="programs" element={<AdminPrograms />} />
              <Route path="programs/:id" element={<AdminProgramDetail />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="resources" element={<AdminResources />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="history" element={<AdminHistory />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
