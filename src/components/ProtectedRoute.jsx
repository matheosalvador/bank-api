import { Navigate } from 'react-router';
import { getAuthToken } from '../services/demoAuth';

export function ProtectedRoute({ children }) {
  return getAuthToken() ? children : <Navigate to="/login" replace />;
}
