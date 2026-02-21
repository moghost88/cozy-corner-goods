import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isRecovery: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  clearRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    let isMounted = true;

    /**
     * Consume auth tokens that were extracted from the URL hash
     * by main.tsx BEFORE React mounted (prevents HashRouter race condition).
     */
    const consumeStoredTokens = async () => {
      const stored = sessionStorage.getItem("__supabase_auth_tokens");
      if (!stored) return false;

      // Remove immediately so we don't re-process on re-render
      sessionStorage.removeItem("__supabase_auth_tokens");

      try {
        const { access_token, refresh_token, type } = JSON.parse(stored);

        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error("Error restoring session from redirect:", error.message);
            return false;
          }

          if (isMounted && data.session) {
            setSession(data.session);
            setUser(data.session.user);

            // If this is a password recovery flow, flag it
            if (type === "recovery") {
              setIsRecovery(true);
            }
          }
          return true;
        }
      } catch (err) {
        console.error("Failed to parse stored auth tokens:", err);
      }
      return false;
    };

    const initialize = async () => {
      // First, try to consume tokens from OAuth/recovery redirect
      const wasRedirect = await consumeStoredTokens();

      if (!wasRedirect) {
        // No redirect — check for existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(existingSession);
          setUser(existingSession?.user ?? null);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initialize();

    // Listen for future auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (isMounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (event === "PASSWORD_RECOVERY") {
            setIsRecovery(true);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    setIsRecovery(false);
    await supabase.auth.signOut();
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (!error) {
      setIsRecovery(false);
    }
    return { error };
  };

  const clearRecovery = () => {
    setIsRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isRecovery,
        signUp,
        signIn,
        signOut,
        updatePassword,
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
