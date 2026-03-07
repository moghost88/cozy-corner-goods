import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, ArrowRight, Mail, Lock, User,
  Loader2, KeyRound, CheckCircle2, ShieldCheck,
  Store, ShoppingBag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpeg";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  displayName: z.string().trim().max(100).optional(),
});

type AuthMode = "login" | "signup" | "forgot" | "reset";

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [role, setRole] = useState<"client" | "seller">("client");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // SECURITY: Client-side rate limiting
  const [submitCount, setSubmitCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setSubmitCount(0);
        setLockCountdown(0);
      } else {
        setLockCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const { signIn, signUp, signInWithGoogle, user, isRecovery, updatePassword, resetPassword, clearRecovery } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  // Detect recovery flow from URL or AuthContext
  useEffect(() => {
    const isRecoveryFromUrl = searchParams.get("recovery") === "true";
    if (isRecovery || isRecoveryFromUrl) {
      setMode("reset");
    }
  }, [isRecovery, searchParams]);

  // Redirect if user is signed in (and not in recovery mode)
  useEffect(() => {
    if (user && mode !== "reset" && !isRecovery) {
      navigate("/", { replace: true });
    }
  }, [user, navigate, mode, isRecovery]);

  const validateForm = () => {
    const fieldErrors: Record<string, string> = {};

    if (mode === "forgot") {
      try {
        authSchema.pick({ email: true }).parse({ email });
      } catch (e) {
        if (e instanceof z.ZodError) {
          e.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
          });
        }
      }
    } else if (mode === "reset") {
      if (password.length < 6) {
        fieldErrors.password = "Password must be at least 6 characters";
      }
      if (password !== confirmPassword) {
        fieldErrors.confirmPassword = "Passwords do not match";
      }
    } else {
      try {
        if (mode === "login") {
          authSchema.pick({ email: true, password: true }).parse({ email, password });
        } else {
          authSchema.parse({ email, password, displayName: displayName || undefined });
        }
      } catch (e) {
        if (e instanceof z.ZodError) {
          e.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
          });
        }
      }
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // SECURITY: Check rate limit
    if (lockedUntil && Date.now() < lockedUntil) {
      toast({
        title: t("auth.tooManyAttempts") || "Too many attempts",
        description: `${t("auth.tryAgainIn") || "Try again in"} ${lockCountdown}s`,
        variant: "destructive",
      });
      return;
    }

    const newCount = submitCount + 1;
    setSubmitCount(newCount);
    if (newCount >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: t("auth.loginFailed") || "Login Failed",
            description: error.message.includes("Invalid login credentials")
              ? (t("auth.invalidCredentials") || "Invalid email or password")
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: t("auth.welcomeBackToast") || "Welcome back!",
            description: t("auth.successLogin") || "You have signed in successfully.",
          });
          navigate("/");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, displayName, role);
        if (error) {
          toast({
            title: error.message.includes("already registered")
              ? (t("auth.accountExists") || "Account exists")
              : (t("auth.signUpFailed") || "Sign up failed"),
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: t("auth.accountCreated") || "Account Created",
            description: t("auth.welcomeToStore") || "Welcome to the store!",
          });
          navigate("/");
        }
      } else if (mode === "forgot") {
        // Send password reset email via Firebase
        const { error } = await resetPassword(email);

        if (error) {
          toast({
            title: t("common.error") || "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setResetSent(true);
        }
      } else if (mode === "reset") {
        // Update password
        const { error } = await updatePassword(password);
        if (error) {
          toast({
            title: t("common.error") || "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setPasswordUpdated(true);
          clearRecovery();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in is handled via Firebase popup — no redirect URL needed

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetSent(false);
    setPasswordUpdated(false);
  };

  // ——————————————————————————————
  // RENDER: Password updated success
  // ——————————————————————————————
  const renderPasswordUpdated = () => (
    <motion.div
      key="password-updated"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-4 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <ShieldCheck className="h-8 w-8 text-green-500" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t("auth.passwordUpdated") || "Password Updated!"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.passwordUpdatedDesc") || "Your password has been updated. You can now sign in with your new password."}
        </p>
      </div>
      <Button
        variant="hero"
        className="mt-2 w-full"
        onClick={() => {
          switchMode("login");
          navigate("/", { replace: true });
        }}
      >
        {t("auth.goToHome") || "Go to Home"}
      </Button>
    </motion.div>
  );

  // ——————————————————————————————
  // RENDER: Reset email sent success
  // ——————————————————————————————
  const renderResetSent = () => (
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
  );

  // ——————————————————————————————
  // RENDER: Set New Password form (recovery mode)
  // ——————————————————————————————
  const renderResetForm = () => (
    <motion.div
      key="reset-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
      </div>
      <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
        {t("auth.setNewPassword") || "Set New Password"}
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        {t("auth.setNewPasswordDesc") || "Enter your new password below."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">{t("auth.newPassword") || "New Password"}</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-password"
              type="password"
              placeholder={t("auth.newPasswordPlaceholder") || "Enter new password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ps-10"
              required
              minLength={6}
            />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t("auth.confirmPassword") || "Confirm Password"}</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              placeholder={t("auth.confirmPasswordPlaceholder") || "Confirm new password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="ps-10"
              required
              minLength={6}
            />
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("auth.updatingPassword") || "Updating..."}
            </>
          ) : (
            t("auth.updatePassword") || "Update Password"
          )}
        </Button>
      </form>
    </motion.div>
  );

  // ——————————————————————————————
  // RENDER: Forgot Password form
  // ——————————————————————————————
  const renderForgotForm = () => (
    <motion.div
      key="forgot-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
      </div>
      <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
        {t("auth.forgotPassword") || "Forgot Password?"}
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        {t("auth.forgotPasswordDesc") || "Enter your email and we'll send you a reset link."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">{t("auth.email")}</Label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reset-email"
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

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("auth.sendingReset") || "Sending..."}
            </>
          ) : (
            t("auth.sendResetLink") || "Send Reset Link"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => switchMode("login")}
        >
          <BackArrow className="me-2 h-4 w-4" />
          {t("auth.backToLogin") || "Back to Sign In"}
        </Button>
      </form>
    </motion.div>
  );

  // ——————————————————————————————
  // RENDER: Login / Signup form
  // ——————————————————————————————
  const renderAuthForm = () => (
    <motion.div
      key={mode + "-form"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="wait">
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
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display name (signup) */}
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
                    maxLength={100}
                  />
                </div>
                {errors.displayName && <p className="text-sm text-destructive">{errors.displayName}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role selector (signup only) */}
        <AnimatePresence>
          {mode === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pb-4">
                <Label>{t("auth.accountType") || "I want to"}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("client")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${role === "client"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                  >
                    <ShoppingBag className={`h-6 w-6 ${role === "client" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${role === "client" ? "text-primary" : "text-muted-foreground"}`}>
                      {t("auth.roleClient") || "Shop & Buy"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${role === "seller"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                  >
                    <Store className={`h-6 w-6 ${role === "seller" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${role === "seller" ? "text-primary" : "text-muted-foreground"}`}>
                      {t("auth.roleSeller") || "Sell Products"}
                    </span>
                  </button>
                </div>
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
              maxLength={254}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        {/* Password */}
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
              required
              maxLength={128}
            />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || (lockedUntil !== null && Date.now() < lockedUntil)}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "login" ? t("auth.signingIn") : t("auth.creatingAccount")}
            </>
          ) : mode === "login" ? (
            t("auth.signIn")
          ) : (
            t("auth.createAccount")
          )}
        </Button>
      </form>

      {/* Divider */}
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

      {/* Google */}
      <Button
        variant="outline"
        type="button"
        className="w-full"
        disabled={isGoogleLoading}
        onClick={async () => {
          try {
            setIsGoogleLoading(true);
            const { error } = await signInWithGoogle();
            if (error) throw error;
          } catch (error: any) {
            toast({
              title: t("common.error") || "Error",
              description: error.message || "Failed to sign in with Google",
              variant: "destructive",
            });
          } finally {
            setIsGoogleLoading(false);
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

      {/* Switch login/signup */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
        </button>
      </div>
    </motion.div>
  );

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
              {passwordUpdated && renderPasswordUpdated()}
              {!passwordUpdated && resetSent && renderResetSent()}
              {!passwordUpdated && !resetSent && mode === "reset" && renderResetForm()}
              {!passwordUpdated && !resetSent && mode === "forgot" && renderForgotForm()}
              {!passwordUpdated && !resetSent && (mode === "login" || mode === "signup") && renderAuthForm()}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
