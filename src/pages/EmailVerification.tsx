import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useCart } from '@context/CartContext';
import { getNetworkErrorMessage } from '@utils/apiError';
import { getApiUrl } from '@utils/apiUrl';

const API_URL = getApiUrl();

export default function EmailVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { state: cartState } = useCart();

  const userId = location.state?.userId;
  const email = location.state?.email || '';

  useEffect(() => {
    if (!userId) {
      navigate('/signup');
    }
  }, [userId, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp: otpString }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      // Success - login and redirect (pass cart for sync)
      await login(data.token, data.user, cartState.items);
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

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend code');
        return;
      }

      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(getNetworkErrorMessage());
      } else {
        setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      }
    } finally {
      setResending(false);
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
        maxWidth: '500px',
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
            Verify Your Email
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.7, marginBottom: '0.5rem' }}>
            We've sent a verification code to
          </p>
          <p style={{ color: 'var(--mint)', fontWeight: 600 }}>
            {email || 'your email'}
          </p>
        </div>

        <form onSubmit={handleVerify}>
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

          <div className="otp-container" style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="otp-input"
                style={{
                  width: '60px',
                  height: '70px',
                  textAlign: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'inherit',
                  transition: 'var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--mint)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(68, 176, 144, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary"
            style={{
              width: '100%',
              marginBottom: '1.5rem',
              opacity: loading || otp.join('').length !== 6 ? 0.7 : 1,
              cursor: loading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--ink)', opacity: 0.7, marginBottom: '1rem' }}>
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--mint)',
              fontWeight: 600,
              cursor: resending ? 'not-allowed' : 'pointer',
              opacity: resending ? 0.7 : 1,
              fontSize: '1rem',
              textDecoration: 'underline'
            }}
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
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
          .otp-container {
            gap: 0.75rem !important;
          }
          .otp-input {
            width: 50px !important;
            height: 60px !important;
            font-size: 1.5rem !important;
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




