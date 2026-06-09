import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

export function GrowFooter() {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: 'Programs',
      links: [
        { label: 'Apply', to: '/apply' },
        { label: 'Browse Entrepreneurs', to: '/entrepreneurs' },
        { label: 'Seed Fund', to: '/seed-fund' },
        { label: 'Contact Us', to: '/contact' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/#about' },
        { label: 'How It Works', to: '/#how-it-works' },
        { label: 'Partners', to: '/#partners' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', to: '/blog' },
        { label: 'Success Stories', to: '/#stories' },
        { label: 'FAQ', to: '/#faq' },
        { label: 'Contact', to: '/contact' },
      ],
    },
  ];

  const socials = [
    { Icon: Facebook, href: '#', label: 'Facebook' },
    { Icon: Twitter, href: '#', label: 'Twitter' },
    { Icon: Linkedin, href: '#', label: 'LinkedIn' },
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-grow-navy text-white/80 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3">
            <Link to="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="font-display text-2xl font-bold text-white">Grow Movement</span>
            </Link>
            <p className="text-white/60 max-w-md leading-relaxed mb-6">
              Empowering young entrepreneurs through capacity building, coaching,
              and strategic connections with investors worldwide.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><a href="mailto:violet@growmovement.org" className="hover:text-white transition-colors">violet@growmovement.org</a></li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><a href="tel:+447943592369" className="hover:text-white">+44 (0) 7943 592 369</a></li>
              <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-primary mt-1" /><span>86–90 Paul Street, London, England EC2A 4NE</span></li>
            </ul>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{s.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-white/60 hover:text-primary transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/40">© {year} Grow Movement. All rights reserved.</div>
          <div className="flex items-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary border border-white/10 flex items-center justify-center transition-all hover:scale-110"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-5 text-xs text-white/40">
            <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
