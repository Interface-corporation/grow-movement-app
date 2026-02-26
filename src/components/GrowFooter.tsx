import { Link } from 'react-router-dom';

export function GrowFooter() {
  return (
    <footer className="bg-grow-navy text-white/80 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-display text-xl font-bold text-white">
                Grow Movement
              </span>
            </div>
            <p className="text-white/60 max-w-sm leading-relaxed">
              Empowering young entrepreneurs through capacity building, coaching, 
              and strategic connections with investors worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/entrepreneurs" className="hover:text-white transition-colors">Entrepreneurs</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Selection Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>info@growmovement.org</li>
              <li>Kigali, Rwanda</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/40">
          © {new Date().getFullYear()} Grow Movement. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
