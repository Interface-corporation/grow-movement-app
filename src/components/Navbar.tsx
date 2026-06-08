import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X, ShoppingCart, LayoutDashboard, Heart } from 'lucide-react';
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

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/entrepreneurs', label: 'Entrepreneurs' },
    { to: '/seed-fund', label: 'Seed Fund' },
    { to: '/blog', label: 'Blog' },
    { to: '/apply', label: 'Apply' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-grow-navy/40 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-display font-bold text-base">G</span>
            </div>
            <span className={`font-display text-xl font-bold tracking-tight ${scrolled ? 'text-foreground' : 'text-white drop-shadow'}`}>
              Grow Movement
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => {
              const active = isActive(link.to);
              const base = scrolled ? 'text-foreground/85 hover:text-primary' : 'text-white/90 hover:text-white drop-shadow';
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-semibold transition-colors relative ${active ? (scrolled ? 'text-primary' : 'text-white') : base}`}
                >
                  {link.label}
                  {active && (
                    <span className={`absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full ${scrolled ? 'bg-primary' : 'bg-white'}`} />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className={`relative ${scrolled ? '' : 'text-white hover:bg-white/15 hover:text-white'}`}>
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
              <Link to="/donate" className="hidden md:block">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
                  <Heart className="h-4 w-4 fill-current" /> Donate
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
          <div className={`md:hidden py-4 border-t ${scrolled ? 'border-border' : 'border-white/10 bg-grow-navy/95'} -mx-4 px-4 sm:-mx-6 sm:px-6`}>
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/10'
                      : scrolled ? 'text-foreground/85 hover:bg-muted' : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/donate" onClick={() => setMobileOpen(false)} className="mt-2">
                <Button size="sm" className="w-full bg-primary text-primary-foreground gap-2">
                  <Heart className="h-4 w-4 fill-current" /> Donate
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
