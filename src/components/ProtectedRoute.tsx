import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import EmailVerificationWall from "@/components/EmailVerificationWall";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps any route that requires authentication AND a verified email.
 *
 * Guard order:
 *  1. Loading  → show branded splash while Firebase resolves session
 *  2. No user  → redirect to /auth
 *  3. Unverified email (email/password accounts only) → show verification wall
 *  4. All good → render children
 *
 * Google accounts skip step 3 because Google already verified the address.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, emailVerified } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Google sign-in sets emailVerified = true automatically.
  // Only email/password accounts need to pass through the wall.
  if (!emailVerified) {
    return <EmailVerificationWall />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
