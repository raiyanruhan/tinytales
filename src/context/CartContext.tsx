import React, { createContext, useContext, useMemo, useReducer } from 'react'

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

const CartContext = createContext<{
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string, size?: string) => void
  setQuantity: (id: string, quantity: number, size?: string) => void
  clear: () => void
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
    default:
      return state
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => dispatch({ type: 'add', item, quantity })
  const removeItem = (id: string, size?: string) => dispatch({ type: 'remove', id, size })
  const setQuantity = (id: string, quantity: number, size?: string) => dispatch({ type: 'setQty', id, quantity, size })
  const clear = () => dispatch({ type: 'clear' })

  const { totalQty, totalPrice } = useMemo(() => {
    const qty = state.items.reduce((n, i) => n + i.quantity, 0)
    const price = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return { totalQty: qty, totalPrice: price }
  }, [state.items])

  const value = useMemo(() => ({ state, addItem, removeItem, setQuantity, clear, totalQty, totalPrice }), [state, totalQty, totalPrice])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


