import { createContext, useContext, useState, ReactNode } from 'react';
import { Entrepreneur } from '@/data/mockEntrepreneurs';

interface CartItem {
  entrepreneur: Entrepreneur;
  priority: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (entrepreneur: Entrepreneur) => boolean;
  removeFromCart: (entrepreneurId: string) => void;
  isInCart: (entrepreneurId: string) => boolean;
  updatePriority: (entrepreneurId: string, priority: number) => void;
  clearCart: () => void;
  isFull: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const MAX_CART_SIZE = 3;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (entrepreneur: Entrepreneur): boolean => {
    if (items.length >= MAX_CART_SIZE) return false;
    if (items.some(item => item.entrepreneur.id === entrepreneur.id)) return false;
    
    const nextPriority = items.length + 1;
    setItems(prev => [...prev, { entrepreneur, priority: nextPriority }]);
    return true;
  };

  const removeFromCart = (entrepreneurId: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.entrepreneur.id !== entrepreneurId);
      // Re-assign priorities
      return filtered.map((item, index) => ({ ...item, priority: index + 1 }));
    });
  };

  const isInCart = (entrepreneurId: string) => {
    return items.some(item => item.entrepreneur.id === entrepreneurId);
  };

  const updatePriority = (entrepreneurId: string, priority: number) => {
    setItems(prev => prev.map(item =>
      item.entrepreneur.id === entrepreneurId ? { ...item, priority } : item
    ));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      isInCart,
      updatePriority,
      clearCart,
      isFull: items.length >= MAX_CART_SIZE,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
