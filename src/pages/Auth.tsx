import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Mail, Lock, User, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpeg";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  displayName: z.string().trim().max(100).optional(),
});

type AuthMode = "login" | "signup" | "forgot";

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});

  const { signIn, signUp, user } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Handle auth events (Google redirect)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        toast({
          title: t("auth.welcomeBackToast"),
          description: t("auth.successLogin"),
        });
        navigate("/", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, toast, t]);

  const validateForm = () => {
    try {
      if (mode === "login") {
        authSchema.pick({ email: true, password: true }).parse({ email, password });
      } else if (mode === "signup") {
        authSchema.parse({ email, password, displayName: displayName || undefined });
      } else {
        authSchema.pick({ email: true }).parse({ email });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: typeof errors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: t("auth.loginFailed"),
            description: error.message.includes("Invalid login credentials")
              ? t("auth.invalidCredentials")
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: t("auth.welcomeBackToast"), description: t("auth.successLogin") });
          navigate("/");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({
            title: error.message.includes("already registered") ? t("auth.accountExists") : t("auth.signUpFailed"),
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: t("auth.accountCreated"), description: t("auth.welcomeToStore") });
          navigate("/");
        }
      } else {
        // Forgot password
        const redirectUrl = `${window.location.origin}${window.location.pathname}#/auth`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });

        if (error) {
          toast({
            title: t("common.error") || "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setResetSent(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getGoogleRedirectUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    if (pathname && pathname !== "/" && !pathname.endsWith("/")) {
      return `${origin}${pathname}/`;
    }
    return `${origin}${pathname}`;
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetSent(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <BackArrow className="h-4 w-4" />
            {t("auth.backToHome")}
          </Link>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-border bg-card p-8 shadow-card"
            style={{ willChange: "opacity, transform" }}
          >
            <div className="mb-6 flex items-center justify-center">
              <img src={logo} alt="معرض الطباخ" className="h-16 w-16 rounded-xl object-contain" />
            </div>

            <AnimatePresence mode="wait">
              {/* ——— Login / Signup header ——— */}
              {(mode === "login" || mode === "signup") && (
                <motion.div
                  key={mode}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
                    {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
                  </h1>
                  <p className="mb-8 text-center text-muted-foreground">
                    {mode === "login" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
                  </p>
                </motion.div>
              )}

              {/* ——— Forgot password header ——— */}
              {mode === "forgot" && (
                <motion.div
                  key="forgot-header"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <KeyRound className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
                    {t("auth.forgotPassword") || "Forgot Password?"}
                  </h1>
                  <p className="mb-8 text-center text-sm text-muted-foreground">
                    {t("auth.forgotPasswordDesc") || "Enter your email and we'll send you a reset link."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ——— Password reset success state ——— */}
              {resetSent ? (
                <motion.div
                  key="reset-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-4 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {t("auth.resetEmailSent") || "Check your email"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("auth.resetEmailSentDesc") || `We've sent a password reset link to ${email}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => switchMode("login")}
                  >
                    {t("auth.backToLogin") || "Back to Sign In"}
                  </Button>
                </motion.div>
              ) : (
                /* ——— Form ——— */
                <motion.form
                  key={mode + "-form"}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Display name (signup only) */}
                  <AnimatePresence>
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pb-4">
                          <Label htmlFor="displayName">{t("auth.displayName")}</Label>
                          <div className="relative">
                            <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="displayName"
                              type="text"
                              placeholder={t("auth.displayNamePlaceholder")}
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="ps-10"
                            />
                          </div>
                          {errors.displayName && (
                            <p className="text-sm text-destructive">{errors.displayName}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="ps-10"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  {/* Password (not for forgot) */}
                  <AnimatePresence>
                    {mode !== "forgot" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password">{t("auth.password")}</Label>
                            {mode === "login" && (
                              <button
                                type="button"
                                onClick={() => switchMode("forgot")}
                                className="text-xs text-primary hover:underline"
                              >
                                {t("auth.forgotPassword") || "Forgot password?"}
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              placeholder={t("auth.passwordPlaceholder")}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="ps-10"
                              required={mode !== "forgot"}
                            />
                          </div>
                          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {mode === "login"
                          ? t("auth.signingIn")
                          : mode === "signup"
                            ? t("auth.creatingAccount")
                            : (t("auth.sendingReset") || "Sending reset link...")}
                      </>
                    ) : mode === "login" ? (
                      t("auth.signIn")
                    ) : mode === "signup" ? (
                      t("auth.createAccount")
                    ) : (
                      t("auth.sendResetLink") || "Send Reset Link"
                    )}
                  </Button>

                  {/* Forgot password back link */}
                  {mode === "forgot" && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      onClick={() => switchMode("login")}
                    >
                      <BackArrow className="me-2 h-4 w-4" />
                      {t("auth.backToLogin") || "Back to Sign In"}
                    </Button>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Google & social section — hide in forgot mode */}
            {mode !== "forgot" && !resetSent && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {t("auth.orContinueWith") || "Or continue with"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={isGoogleLoading}
                  onClick={async () => {
                    try {
                      setIsGoogleLoading(true);
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                          redirectTo: getGoogleRedirectUrl(),
                          queryParams: { access_type: "offline", prompt: "consent" },
                        },
                      });
                      if (error) throw error;
                    } catch (error: any) {
                      setIsGoogleLoading(false);
                      toast({
                        title: t("common.error") || "Error",
                        description: error.message || "Failed to sign in with Google",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg
                      className={`${dir === "rtl" ? "ml-2" : "mr-2"} h-4 w-4`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 488 512"
                    >
                      <path
                        fill="currentColor"
                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                      />
                    </svg>
                  )}
                  {t("auth.google") || "Google"}
                </Button>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
