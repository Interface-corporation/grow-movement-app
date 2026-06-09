import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X, ShoppingCart, LayoutDashboard, Vote } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/entrepreneurs', label: 'Entrepreneurs' },
    { to: '/seed-fund', label: 'Seed Fund' },
    { to: '/blog', label: 'Blog' },
    { to: '/apply', label: 'Apply' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-grow-navy/55 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-display font-bold text-base">G</span>
            </div>
            <span
              className={`font-display text-xl font-bold tracking-tight ${
                scrolled ? 'text-foreground' : 'text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]'
              }`}
            >
              Grow Movement
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-sm font-semibold px-3 py-2 rounded-lg transition-all ${
                    scrolled
                      ? active
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/85 hover:text-primary hover:bg-primary/5'
                      : active
                        ? 'text-white bg-white/15 backdrop-blur-sm [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]'
                        : 'text-white/95 hover:text-white hover:bg-white/10 [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span
                      className={`absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full ${
                        scrolled ? 'bg-primary' : 'bg-grow-gold'
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`relative ${scrolled ? '' : 'text-white hover:bg-white/15 hover:text-white'}`}
              >
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {items.length}
                  </span>
                )}
              </Button>
            </Link>
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
              className={`md:hidden p-2 rounded-md ${scrolled ? 'text-foreground' : 'text-white'}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className={`md:hidden py-4 border-t ${
              scrolled ? 'border-border' : 'border-white/10 bg-grow-navy/95'
            } -mx-4 px-4 sm:-mx-6 sm:px-6`}
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/10'
                      : scrolled
                        ? 'text-foreground/85 hover:bg-muted'
                        : 'text-white/95 hover:bg-white/10'
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
