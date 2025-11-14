import { getSavedCart, saveCart, CartItem } from '@services/cartApi';
import { getOrdersByEmail } from '@services/orderApi';

export interface CartMergeDecision {
  needsDecision: boolean;
  hasServerCart: boolean;
  hasLocalCart: boolean;
}

export async function syncCartOnLogin(
  userId: string,
  email: string,
  localCart: CartItem[]
): Promise<CartMergeDecision> {
  try {
    // Check if user has past orders
    const orders = await getOrdersByEmail(email);
    const hasPastOrders = orders && orders.length > 0;

    // Get server cart
    const serverCart = await getSavedCart(userId);
    const hasServerCart = serverCart && serverCart.length > 0;
    const hasLocalCart = localCart && localCart.length > 0;

    // If account has no past orders, sync local cart to server
    if (!hasPastOrders && hasLocalCart) {
      await saveCart(userId, localCart);
      return { needsDecision: false, hasServerCart: false, hasLocalCart: true };
    }

    // If account has past orders and both carts exist, need user decision
    if (hasPastOrders && hasServerCart && hasLocalCart) {
      return { needsDecision: true, hasServerCart: true, hasLocalCart: true };
    }

    // If only server cart exists, use it
    if (hasServerCart && !hasLocalCart) {
      return { needsDecision: false, hasServerCart: true, hasLocalCart: false };
    }

    // If only local cart exists, sync to server
    if (hasLocalCart && !hasServerCart) {
      await saveCart(userId, localCart);
      return { needsDecision: false, hasServerCart: false, hasLocalCart: true };
    }

    return { needsDecision: false, hasServerCart: false, hasLocalCart: false };
  } catch (error) {
    console.error('Error syncing cart on login:', error);
    return { needsDecision: false, hasServerCart: false, hasLocalCart: false };
  }
}

export async function saveCartToServer(userId: string, cartItems: CartItem[]): Promise<void> {
  try {
    await saveCart(userId, cartItems);
  } catch (error) {
    console.error('Error saving cart to server:', error);
  }
}

export async function loadCartFromServer(userId: string): Promise<CartItem[] | null> {
  try {
    return await getSavedCart(userId);
  } catch (error) {
    console.error('Error loading cart from server:', error);
    return null;
  }
}

export function clearLocalCart(): void {
  // Clear localStorage cart
  localStorage.removeItem('cart');
}






