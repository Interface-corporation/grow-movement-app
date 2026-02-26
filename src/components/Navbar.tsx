import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/entrepreneurs', label: 'Entrepreneurs' },
    { to: '/apply', label: 'Apply' },
    { to: '/apply/coach', label: 'Apply as Coach' },
    { to: '/blog', label: 'Blog' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Grow Movement
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.to) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart & CTA */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
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
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/entrepreneurs" className="hidden md:block">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Find Entrepreneurs
                </Button>
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/entrepreneurs" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full bg-primary text-primary-foreground">
                  Find Entrepreneurs
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
