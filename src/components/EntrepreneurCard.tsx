import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Plus, Check } from 'lucide-react';
import { Entrepreneur } from '@/data/mockEntrepreneurs';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

interface EntrepreneurCardProps {
  entrepreneur: Entrepreneur;
}

export function EntrepreneurCard({ entrepreneur }: EntrepreneurCardProps) {
  const { addToCart, isInCart, removeFromCart, isFull } = useCart();
  const inCart = isInCart(entrepreneur.id);

  const isAlumni = entrepreneur.status === 'Alumni';

  const handleCartToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAlumni) return;
    if (inCart) {
      removeFromCart(entrepreneur.id);
    } else {
      addToCart(entrepreneur);
    }
  };

  return (
    <Link
      to={`/entrepreneurs/${entrepreneur.id}`}
      className="group block bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={entrepreneur.photo}
          alt={entrepreneur.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            entrepreneur.status === 'Alumni'
              ? 'bg-accent text-accent-foreground'
              : 'bg-grow-gold text-grow-navy'
          }`}>
            {isAlumni ? 'Alumni' : 'Admitted'}
          </span>
        </div>
        {/* Cart Button - hidden for Alumni */}
        {!isAlumni && (
          <div className="absolute top-3 right-3">
            <Button
              variant={inCart ? "default" : "secondary"}
              size="icon"
              className={`h-8 w-8 rounded-full shadow-md ${
                inCart
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/90 backdrop-blur-sm hover:bg-card'
              }`}
              onClick={handleCartToggle}
              disabled={!inCart && isFull}
              title={inCart ? 'Remove from selection' : isFull ? 'Cart is full (max 3)' : 'Add to selection'}
            >
              {inCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {entrepreneur.sector}
          </span>
          <span className="text-xs text-muted-foreground">
            {entrepreneur.stage}
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
          {entrepreneur.name}
        </h3>
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {entrepreneur.businessName}
        </p>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {entrepreneur.pitchSummary}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {entrepreneur.country}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {entrepreneur.revenue}
          </span>
        </div>
      </div>
    </Link>
  );
}
