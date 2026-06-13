import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X, LayoutDashboard, Vote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/entrepreneurs', label: 'Entrepreneurs' },
    { to: '/seed-fund', label: 'Seed Fund' },
    { to: '/apply', label: 'Apply' },
    { to: '/contact', label: 'Contact' },
    { to: '/admin', label: 'Login' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Grow Movement home">
            <img
              src="/images/logo.png"
              alt="Grow Movement"
              className="h-10 w-auto object-contain"
              loading="eager"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-sm font-semibold px-3 py-2 rounded-lg transition-all ${
                    active
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/85 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/admin" className="hidden md:block">
                <Button size="sm" variant="outline" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/seed-fund" className="hidden md:block">
                <Button size="sm" className="bg-grow-coral text-white hover:bg-grow-coral/90 gap-2 shadow-lg shadow-grow-coral/20">
                  <Vote className="h-4 w-4" /> Vote 2026
                </Button>
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-md text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border -mx-4 px-4 sm:-mx-6 sm:px-6">
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/85 hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/seed-fund" className="mt-2">
                <Button size="sm" className="w-full bg-grow-coral text-white gap-2">
                  <Vote className="h-4 w-4" /> Vote 2026 Candidates
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
