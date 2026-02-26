import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const { items, removeFromCart, updatePriority, clearCart } = useCart();
  const navigate = useNavigate();

  const movePriority = (entrepreneurId: string, direction: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.priority - b.priority);
    const index = sorted.findIndex(item => item.entrepreneur.id === entrepreneurId);
    
    if (direction === 'up' && index > 0) {
      const swapWith = sorted[index - 1];
      updatePriority(entrepreneurId, swapWith.priority);
      updatePriority(swapWith.entrepreneur.id, sorted[index].priority);
    } else if (direction === 'down' && index < sorted.length - 1) {
      const swapWith = sorted[index + 1];
      updatePriority(entrepreneurId, swapWith.priority);
      updatePriority(swapWith.entrepreneur.id, sorted[index].priority);
    }
  };

  const sortedItems = [...items].sort((a, b) => a.priority - b.priority);

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-3">Your Selection is Empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Browse our entrepreneur directory and add up to 3 entrepreneurs you'd like to connect with.
          </p>
          <Link to="/entrepreneurs">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Browse Entrepreneurs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Your Selection
          </h1>
          <p className="text-muted-foreground">
            {items.length}/3 entrepreneurs selected. Reorder by priority, then submit your request.
          </p>
        </div>

        {/* Selected Entrepreneurs */}
        <div className="space-y-4 mb-8">
          {sortedItems.map((item, index) => (
            <div
              key={item.entrepreneur.id}
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
            >
              {/* Priority Badge */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => movePriority(item.entrepreneur.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {item.priority}
                </span>
                <button
                  onClick={() => movePriority(item.entrepreneur.id, 'down')}
                  disabled={index === sortedItems.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              {/* Photo */}
              <img
                src={item.entrepreneur.photo}
                alt={item.entrepreneur.name}
                className="w-16 h-16 rounded-xl object-cover"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{item.entrepreneur.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {item.entrepreneur.businessName} • {item.entrepreneur.country}
                </p>
                <span className="text-xs text-primary font-medium">{item.entrepreneur.sector}</span>
              </div>

              {/* Remove */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFromCart(item.entrepreneur.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate('/matching-request')}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-base font-semibold"
            size="lg"
          >
            Submit Matching Request
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Clear Selection
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          After submitting, the Grow Movement team will review your request and facilitate the matching process.
        </p>
      </div>
    </div>
  );
}
