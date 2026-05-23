import { Navigate } from 'react-router-dom';
import { useUserStore } from '@/core/store/userStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useUserStore((s) => s.user);
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}
