import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { syncCartOnLogin, clearLocalCart } from '@utils/cartSync';
import { CartItem } from '@context/CartContext';
import { getApiUrl } from '@utils/apiUrl';

interface User {
  id: string;
  email: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, localCart?: CartItem[]) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  cartMergeDecision: { needsDecision: boolean; hasServerCart: boolean; hasLocalCart: boolean } | null;
  resolveCartMerge: (useLocal: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = getApiUrl();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartMergeDecision, setCartMergeDecision] = useState<{ needsDecision: boolean; hasServerCart: boolean; hasLocalCart: boolean } | null>(null);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      // Verify token is still valid
      verifyToken(storedToken).then((isValid) => {
        if (isValid) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error: Unable to connect to server');
      } else {
        console.error('Token verification error:', error);
      }
      return false;
    }
  };

  const login = async (newToken: string, newUser: User, localCart: CartItem[] = []) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));

    // Sync cart on login
    if (localCart.length > 0 || newUser) {
      try {
        const decision = await syncCartOnLogin(newUser.id, newUser.email, localCart);
        if (decision.needsDecision) {
          setCartMergeDecision(decision);
        } else {
          // Trigger cart reload if needed
          window.dispatchEvent(new Event('cartSync'));
        }
      } catch (error) {
        console.error('Error syncing cart on login:', error);
      }
    }
  };

  const resolveCartMerge = (useLocal: boolean) => {
    setCartMergeDecision(null);
    // Trigger cart reload
    window.dispatchEvent(new Event('cartSync'));
  };

  const logout = () => {
    // Clear local cart from browser (server cart persists)
    clearLocalCart();
    
    setToken(null);
    setUser(null);
    setCartMergeDecision(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        loading,
        cartMergeDecision,
        resolveCartMerge
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}




