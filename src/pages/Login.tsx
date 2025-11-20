import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useCart } from '@context/CartContext';
import { getNetworkErrorMessage } from '@utils/apiError';
import { getApiUrl } from '@utils/apiUrl';
import { sanitizeText } from '@utils/sanitize';
import { addCsrfTokenToHeaders } from '@utils/csrf';

const API_URL = getApiUrl();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { state: cartState } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Sanitize inputs
    const sanitizedEmail = sanitizeText(email.toLowerCase().trim());
    const sanitizedPassword = password; // Don't sanitize password, just validate

    try {
      // Ensure CSRF token is available before making request
      const { getCsrfToken, refreshCsrfToken } = await import('@utils/csrf')
      let csrfToken = await getCsrfToken()
      
      if (!csrfToken) {
        console.log('Fetching CSRF token before login...')
        csrfToken = await refreshCsrfToken()
        if (!csrfToken) {
          setError('Unable to establish secure connection. Please refresh the page and try again.')
          setLoading(false)
          return
        }
      }

      const headers = await addCsrfTokenToHeaders({
        'Content-Type': 'application/json',
      });

      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
        credentials: 'include', // Include httpOnly cookies
      });
      
      // Validate CSRF response - if it fails, try refreshing token and retry once
      const { validateCsrfResponse } = await import('@utils/csrf')
      let finalResponse = response
      
      try {
        await validateCsrfResponse(response)
      } catch (csrfError) {
        if (csrfError instanceof Error && csrfError.message.includes('CSRF')) {
          // Token might be expired, refresh and retry once
          console.log('CSRF validation failed, refreshing token and retrying...')
          await refreshCsrfToken()
          const retryHeaders = await addCsrfTokenToHeaders({
            'Content-Type': 'application/json',
          })
          finalResponse = await fetch(`${API_URL}/auth/signin`, {
            method: 'POST',
            headers: retryHeaders,
            body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
            credentials: 'include',
          })
          await validateCsrfResponse(finalResponse)
        } else {
          throw csrfError
        }
      }

      let data;
      try {
        data = await finalResponse.json();
      } catch (jsonError) {
        throw new Error(`Server error: ${finalResponse.status} ${finalResponse.statusText}`);
      }

      if (!finalResponse.ok) {
        if (data.needsVerification) {
          // Redirect to verification page
          navigate('/verify-email', { state: { userId: data.userId } });
          return;
        }
        setError(data.error || 'Sign in failed');
        return;
      }

      // Success - pass cart for sync
      // Backend returns accessToken (not token) and refreshToken
      const token = data.accessToken || data.token
      const refreshToken = data.refreshToken
      await login(token, data.user, cartState.items, refreshToken);
      navigate('/');
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(getNetworkErrorMessage());
      } else {
        setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, var(--cream) 0%, var(--paper) 100%)'
    }}>
      <div className="auth-card" style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: "'Barriecito', cursive",
            fontSize: '2.5rem',
            color: 'var(--mint)',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.7 }}>
            Sign in to your TinyTales account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--ink)',
              fontWeight: 600
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'var(--transition-fast)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--mint)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--ink)',
              fontWeight: 600
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'var(--transition-fast)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--mint)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              marginBottom: '1.5rem',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: 'var(--ink)', opacity: 0.7 }}>
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{
              color: 'var(--mint)',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .auth-page {
            padding: 1rem !important;
            align-items: flex-start !important;
            padding-top: 2rem !important;
          }
          .auth-card {
            padding: 2rem 1.5rem !important;
          }
          .auth-card h1 {
            font-size: 2rem !important;
          }
          .auth-card input {
            font-size: 16px !important;
            padding: 12px 16px !important;
            min-height: 44px !important;
          }
          .auth-card button {
            min-height: 44px !important;
          }
        }
      `}</style>
    </div>
  );
}




