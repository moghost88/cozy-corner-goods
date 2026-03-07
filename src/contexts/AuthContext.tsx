import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth, googleProvider } from "@/integrations/firebase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isRecovery: boolean;
  signUp: (email: string, password: string, displayName?: string, role?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  clearRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string, _role?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return { error: null };
    } catch (error: any) {
      return { error: mapFirebaseError(error) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: mapFirebaseError(error) };
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { error: null };
    } catch (error: any) {
      console.error("Google sign-in error:", {
        code: error?.code,
        message: error?.message,
        customData: error?.customData,
        fullError: error,
      });
      return { error: mapFirebaseError(error) };
    }
  };

  const signOutUser = async () => {
    setIsRecovery(false);
    await firebaseSignOut(auth);
  };

  // SECURITY: Auto-logout on inactivity (30 minutes)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("Session expired due to inactivity");
        signOutUser();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Listen for user activity
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    // Start the timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const updatePasswordFn = async (newPassword: string) => {
    try {
      if (!auth.currentUser) {
        return { error: new Error("No user is currently signed in") };
      }
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      setIsRecovery(false);
      return { error: null };
    } catch (error: any) {
      return { error: mapFirebaseError(error) };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      return { error: mapFirebaseError(error) };
    }
  };

  const clearRecovery = () => {
    setIsRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isRecovery,
        signUp,
        signIn,
        signInWithGoogle,
        signOut: signOutUser,
        updatePassword: updatePasswordFn,
        resetPassword,
        clearRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Map Firebase error codes to user-friendly messages.
 */
function mapFirebaseError(error: any): Error {
  const code = error?.code || "";
  const messageMap: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
    "auth/invalid-email": "Invalid email address.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",
    "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/popup-blocked": "Sign-in popup was blocked by the browser. Please allow popups.",
    "auth/requires-recent-login": "Please sign in again before updating your password.",
  };

  return new Error(messageMap[code] || error?.message || "An unexpected error occurred.");
}
