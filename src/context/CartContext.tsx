import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react'
import { saveCartToServer, loadCartFromServer } from '@services/cartApi'
import { toast } from '@utils/toast'

export type CartItem = {
  id: string
  name: string
  price: number
  image: string
  size?: string
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'quantity'>; quantity?: number }
  | { type: 'remove'; id: string; size?: string }
  | { type: 'setQty'; id: string; size?: string; quantity: number }
  | { type: 'clear' }
  | { type: 'setItems'; items: CartItem[] }

const CartContext = createContext<{
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string, size?: string) => void
  setQuantity: (id: string, quantity: number, size?: string) => void
  clear: () => void
  setItems: (items: CartItem[]) => void
  totalQty: number
  totalPrice: number
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const quantity = action.quantity ?? 1
      const idx = state.items.findIndex(i => i.id === action.item.id && i.size === action.item.size)
      if (idx >= 0) {
        const next = [...state.items]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return { items: next }
      }
      return { items: [...state.items, { ...action.item, quantity }] }
    }
    case 'remove': {
      return { items: state.items.filter(i => !(i.id === action.id && i.size === action.size)) }
    }
    case 'setQty': {
      const next = state.items.map(i => i.id === action.id && i.size === action.size ? { ...i, quantity: action.quantity } : i)
      return { items: next }
    }
    case 'clear':
      return { items: [] }
    case 'setItems':
      return { items: action.items }
    default:
      return state
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage on mount
  const loadFromStorage = (): CartItem[] => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const [state, dispatch] = useReducer(cartReducer, { items: loadFromStorage() });

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
    
    // Save to server if user is logged in (check from localStorage)
    const storedUser = localStorage.getItem('authUser');
    if (storedUser && state.items.length > 0) {
      try {
        const user = JSON.parse(storedUser);
        saveCartToServer(user.id, state.items).catch(err => 
          console.error('Failed to save cart to server:', err)
        );
      } catch {
        // Ignore parse errors
      }
    }
  }, [state.items]);

  // Load from server on login (listen to cartSync event)
  useEffect(() => {
    const handleCartSync = async () => {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const serverCart = await loadCartFromServer(user.id);
          if (serverCart && serverCart.length > 0) {
            // Merge with local cart or replace based on merge decision
            const localCart = loadFromStorage();
            if (localCart.length === 0) {
              // No local cart, use server cart
              dispatch({ type: 'setItems', items: serverCart });
            }
          }
        } catch (error) {
          console.error('Error loading cart from server:', error);
        }
      }
    };

    window.addEventListener('cartSync', handleCartSync);
    // Initial load if user is already logged in
    handleCartSync();

    return () => {
      window.removeEventListener('cartSync', handleCartSync);
    };
  }, []);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    // Optimistic update - update UI immediately
    dispatch({ type: 'add', item, quantity })
    
    // Show toast notification
    toast.success('Product added to cart', {
      description: `${item.name}${item.size ? ` (${item.size})` : ''} - ${quantity} ${quantity === 1 ? 'item' : 'items'}`,
    })
    
    // Save to server in background (non-blocking)
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const updatedItems = [...state.items];
        const idx = updatedItems.findIndex(i => i.id === item.id && i.size === item.size);
        if (idx >= 0) {
          updatedItems[idx] = { ...updatedItems[idx], quantity: updatedItems[idx].quantity + quantity };
        } else {
          updatedItems.push({ ...item, quantity });
        }
        saveCartToServer(user.id, updatedItems).catch(err => {
          console.error('Failed to save cart to server:', err);
          // Could show error toast here, but optimistic update already happened
        });
      } catch {
        // Ignore parse errors
      }
    }
  }
  
  const removeItem = (id: string, size?: string) => {
    const item = state.items.find(i => i.id === id && i.size === size)
    // Optimistic update - update UI immediately
    dispatch({ type: 'remove', id, size })
    
    if (item) {
      toast.info('Product removed from cart', {
        description: `${item.name}${item.size ? ` (${item.size})` : ''}`,
      })
      
      // Save to server in background
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const updatedItems = state.items.filter(i => !(i.id === id && i.size === size));
          saveCartToServer(user.id, updatedItems).catch(err => {
            console.error('Failed to save cart to server:', err);
          });
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
  
  const setQuantity = (id: string, quantity: number, size?: string) => {
    // Optimistic update
    dispatch({ type: 'setQty', id, quantity, size })
    
    // Save to server in background
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const updatedItems = state.items.map(i => 
          i.id === id && i.size === size ? { ...i, quantity } : i
        );
        saveCartToServer(user.id, updatedItems).catch(err => {
          console.error('Failed to save cart to server:', err);
        });
      } catch {
        // Ignore parse errors
      }
    }
  }
  
  const clear = () => {
    // Optimistic update
    dispatch({ type: 'clear' });
    localStorage.removeItem('cart');
    
    toast.info('Cart cleared', {
      description: 'All items have been removed from your cart',
    })
    
    // Save to server in background
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        saveCartToServer(user.id, []).catch(err => {
          console.error('Failed to save cart to server:', err);
        });
      } catch {
        // Ignore parse errors
      }
    }
  }

  // Add action to set items directly (for cart merge)
  const setItems = (items: CartItem[]) => {
    dispatch({ type: 'setItems', items });
  };

  const { totalQty, totalPrice } = useMemo(() => {
    const qty = state.items.reduce((n, i) => n + i.quantity, 0)
    const price = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return { totalQty: qty, totalPrice: price }
  }, [state.items])

  const value = useMemo(() => ({ 
    state, 
    addItem, 
    removeItem, 
    setQuantity, 
    clear, 
    totalQty, 
    totalPrice,
    setItems
  }), [state, totalQty, totalPrice])
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


