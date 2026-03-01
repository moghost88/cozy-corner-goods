import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isRecovery: boolean;
  signUp: (email: string, password: string, displayName?: string, role?: string) => Promise<{ error: Error | null }>;
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
     * PKCE flow: Exchange the ?code= parameter for a session.
     * The code was extracted from the URL by main.tsx before React mounted.
     */
    const exchangePKCECode = async (): Promise<boolean> => {
      const code = sessionStorage.getItem("__supabase_pkce_code");
      if (!code) return false;

      // Remove immediately to prevent double-exchange
      sessionStorage.removeItem("__supabase_pkce_code");

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("PKCE code exchange failed:", error.message);
          return false;
        }

        if (isMounted && data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
        return true;
      } catch (err) {
        console.error("PKCE exchange error:", err);
        return false;
      }
    };

    /**
     * Legacy fallback: Consume implicit flow tokens stored by main.tsx.
     */
    const consumeStoredTokens = async (): Promise<boolean> => {
      const stored = sessionStorage.getItem("__supabase_auth_tokens");
      if (!stored) return false;

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
      // 1. Try PKCE code exchange first (primary flow)
      let wasRedirect = await exchangePKCECode();

      // 2. Fallback: try implicit flow tokens
      if (!wasRedirect) {
        wasRedirect = await consumeStoredTokens();
      }

      // 3. No redirect — check for existing session
      if (!wasRedirect) {
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

    // Listen for future auth state changes
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

  const signUp = async (email: string, password: string, displayName?: string, role?: string) => {
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
          role: role || "client",
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
