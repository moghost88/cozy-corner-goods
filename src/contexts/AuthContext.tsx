import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/integrations/firebase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, role?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase auth state — single source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // SECURITY: Auto-logout on inactivity (30 minutes)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        firebaseSignOut(auth);
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [user]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName?: string,
    _role?: string,
  ) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName?.trim() && newUser) {
        // Sanitize display name: strip leading/trailing whitespace, limit length
        const sanitized = displayName.trim().slice(0, 100);
        await updateProfile(newUser, { displayName: sanitized });
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: mapFirebaseError(err) };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err: unknown) {
      return { error: mapFirebaseError(err) };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { error: null };
    } catch (err: unknown) {
      // Only log the error code in development — never log credentials or tokens
      if (import.meta.env.DEV) {
        const code = (err as any)?.code;
        console.warn("[Auth] Google sign-in failed:", code);
      }
      return { error: mapFirebaseError(err) };
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const updatePasswordFn = useCallback(async (newPassword: string) => {
    try {
      if (!auth.currentUser) {
        return { error: new Error("No user is currently signed in.") };
      }
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      return { error: null };
    } catch (err: unknown) {
      return { error: mapFirebaseError(err) };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err: unknown) {
      return { error: mapFirebaseError(err) };
    }
  }, []);

  // Memoize context value to prevent unnecessary consumer re-renders
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut: signOutUser,
      updatePassword: updatePasswordFn,
      resetPassword,
    }),
    [user, loading, signUp, signIn, signInWithGoogle, signOutUser, updatePasswordFn, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map Firebase error codes to user-friendly messages without leaking internals. */
function mapFirebaseError(err: unknown): Error {
  const code = (err as any)?.code ?? "";

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
    "auth/invalid-email": "Invalid email address.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",
    "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many failed attempts. Please try again in a few minutes.",
    "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/popup-blocked": "The sign-in popup was blocked. Please allow popups for this site.",
    "auth/requires-recent-login": "Please sign in again to perform this action.",
    "auth/network-request-failed": "A network error occurred. Please check your connection.",
  };

  return new Error(messages[code] ?? "An unexpected error occurred. Please try again.");
}
