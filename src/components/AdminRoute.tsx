import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const ADMIN_EMAIL = 'raiyanbinrashid0@gmail.com';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        background: 'var(--cream)'
      }}>
        <div style={{ fontSize: 18, color: 'var(--navy)' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        background: 'var(--cream)',
        padding: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--coral)' }}>Access Denied</h2>
        <p style={{ color: 'var(--navy)', textAlign: 'center' }}>
          You do not have permission to access this page. Admin access required.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}


