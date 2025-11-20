import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { syncCartOnLogin, clearLocalCart } from '@utils/cartSync';
import { CartItem } from '@context/CartContext';
import { getApiUrl } from '@utils/apiUrl';
import { storeToken, getToken, removeToken, storeUser, getUser, removeUser, clearAuthData, storeRefreshToken, getRefreshToken, removeRefreshToken } from '@utils/secureStorage';

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
    // Listen for token refresh events
    const handleTokenRefresh = (event: CustomEvent) => {
      setToken(event.detail.token);
    };

    // Listen for auth expiration events
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      clearAuthData();
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh as EventListener);
    window.addEventListener('authExpired', handleAuthExpired);

    // Check for stored token on mount (using secure storage)
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      // Verify token is still valid
      verifyToken(storedToken).then((isValid) => {
        if (isValid) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          // Try to refresh token
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            // Token refresh will be handled by secureFetch automatically
            // For now, just set loading to false
            setLoading(false);
          } else {
            clearAuthData();
            setLoading(false);
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh as EventListener);
      window.removeEventListener('authExpired', handleAuthExpired);
    };
  }, []);

  const verifyToken = async (tokenToVerify: string): Promise<boolean> => {
    try {
      const { addCsrfTokenToHeaders } = await import('@utils/csrf');
      const headers = await addCsrfTokenToHeaders({
        'Authorization': `Bearer ${tokenToVerify}`
      });
      
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        headers,
        credentials: 'include' // Include httpOnly cookies
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

  const login = async (newToken: string, newUser: User, localCart: CartItem[] = [], refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    // Use secure storage
    storeToken(newToken);
    storeUser(newUser);
    if (refreshToken) {
      storeRefreshToken(refreshToken);
    }

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

  const logout = async () => {
    // Clear local cart from browser (server cart persists)
    clearLocalCart();
    
    // Try to call logout endpoint (don't block if it fails)
    try {
      const { getApiUrl } = await import('@utils/apiUrl');
      const { addCsrfTokenToHeaders } = await import('@utils/csrf');
      const API_URL = getApiUrl();
      const token = getToken();
      
      if (token) {
        const headers = await addCsrfTokenToHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers,
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    setToken(null);
    setUser(null);
    setCartMergeDecision(null);
    // Use secure storage cleanup
    clearAuthData();
    // Clear CSRF token on logout
    const { clearCsrfToken } = await import('@utils/csrf');
    clearCsrfToken();
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




