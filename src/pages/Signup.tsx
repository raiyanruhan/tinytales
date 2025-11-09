import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign up failed');
        return;
      }

      // Success - redirect to verification page
      navigate('/verify-email', { state: { userId: data.userId, email } });
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, var(--cream) 0%, var(--paper) 100%)'
    }}>
      <div style={{
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
            Join TinyTales
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.7 }}>
            Create your account to get started
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

          <div style={{ marginBottom: '1.5rem' }}>
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
              minLength={6}
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
            <small style={{ color: 'var(--ink)', opacity: 0.6, fontSize: '0.85rem' }}>
              Must be at least 6 characters
            </small>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--ink)',
              fontWeight: 600
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: 'var(--ink)', opacity: 0.7 }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--mint)',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}



