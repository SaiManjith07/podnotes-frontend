import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * After Google redirect (or any sign-in), Firebase may land the user on `/` or `/auth`.
 * Centralize routing: new accounts → interests; returning users → dashboard.
 */
export default function PostLoginRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading || !user) return;
    const path = location.pathname;
    if (path !== '/' && path !== '/auth') return;

    const next = user.interests.length === 0 ? '/interests' : '/dashboard';
    navigate(next, { replace: true });
  }, [user, isLoading, location.pathname, navigate]);

  return null;
}
