import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, ArrowRight, Mail, Lock, User,
  Loader2, KeyRound, CheckCircle2, ShieldCheck,
  Store, ShoppingBag, Eye, EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpeg";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(128),
  displayName: z.string().trim().max(100).optional(),
});

type AuthMode = "login" | "signup" | "forgot" | "reset";

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Auth = () => {
  const [mode, setMode]                     = useState<AuthMode>("login");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName]       = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [loading, setLoading]               = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resetSent, setResetSent]           = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [role, setRole]                     = useState<"client" | "seller">("client");
  const [errors, setErrors]                 = useState<Record<string, string>>({});



  // SECURITY: Client-side rate limiting (5 attempts → 5 min lockout)
  const [submitCount, setSubmitCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

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

  const { signIn, signUp, signInWithGoogle, user, updatePassword, resetPassword } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;
  const isLocked  = lockedUntil !== null && Date.now() < lockedUntil;

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (user && mode !== "reset") {
      navigate("/", { replace: true });
    }
  }, [user, navigate, mode]);



  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  const validateForm = () => {
    const fieldErrors: Record<string, string> = {};

    if (mode === "forgot") {
      try {
        authSchema.pick({ email: true }).parse({ email });
      } catch (e) {
        if (e instanceof z.ZodError)
          e.errors.forEach((err) => { if (err.path[0]) fieldErrors[String(err.path[0])] = err.message; });
      }
    } else if (mode === "reset") {
      if (password.length < 6)  fieldErrors.password        = "Password must be at least 6 characters";
      if (password !== confirmPassword) fieldErrors.confirmPassword = "Passwords do not match";
    } else {
      try {
        if (mode === "login")
          authSchema.pick({ email: true, password: true }).parse({ email, password });
        else
          authSchema.parse({ email, password, displayName: displayName || undefined });
      } catch (e) {
        if (e instanceof z.ZodError)
          e.errors.forEach((err) => { if (err.path[0]) fieldErrors[String(err.path[0])] = err.message; });
      }
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isLocked) {
      toast({
        title: t("auth.tooManyAttempts") || "Too many attempts",
        description: `${t("auth.tryAgainIn") || "Try again in"} ${lockCountdown}s`,
        variant: "destructive",
      });
      return;
    }

    const newCount = submitCount + 1;
    setSubmitCount(newCount);
    if (newCount >= MAX_ATTEMPTS) setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: t("auth.loginFailed") || "Login Failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: t("auth.welcomeBackToast") || "Welcome back!", description: t("auth.successLogin") || "You have signed in successfully." });
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
            title: t("auth.accountCreated") || "Account Created! 🎉",
            description: t("auth.verifyEmailPrompt") || "A verification link has been sent to your email. Please check your inbox to continue.",
            duration: 6000,
          });
          navigate("/");
        }

      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: t("common.error") || "Error", description: error.message, variant: "destructive" });
        } else {
          setResetSent(true);
        }

      } else if (mode === "reset") {
        const { error } = await updatePassword(password);
        if (error) {
          toast({ title: t("common.error") || "Error", description: error.message, variant: "destructive" });
        } else {
          setPasswordUpdated(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetSent(false);
    setPasswordUpdated(false);
    setShowPassword(false);
    // Reset email check so stale status doesn't carry over between forms
    setEmailCheckStatus("idle");
    setEmailCheckMsg("");
  };

  // ---------------------------------------------------------------------------
  // Reusable password input with show/hide toggle
  // ---------------------------------------------------------------------------
  const PasswordInput = ({
    id, value, onChange, placeholder, label, autoComplete = "current-password",
  }: {
    id: string; value: string; onChange: (v: string) => void;
    placeholder: string; label: string; autoComplete?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ps-10 pe-10"
          required
          minLength={6}
          maxLength={128}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // RENDER: Password updated success
  // ---------------------------------------------------------------------------
  const renderPasswordUpdated = () => (
    <motion.div
      key="password-updated"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10" aria-hidden>
        <ShieldCheck className="h-8 w-8 text-green-500" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t("auth.passwordUpdated") || "Password Updated!"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.passwordUpdatedDesc") || "Your password has been updated. You can now sign in."}
        </p>
      </div>
      <Button variant="hero" className="mt-2 w-full" onClick={() => { switchMode("login"); navigate("/", { replace: true }); }}>
        {t("auth.goToHome") || "Go to Home"}
      </Button>
    </motion.div>
  );

  // ---------------------------------------------------------------------------
  // RENDER: Reset email sent success
  // ---------------------------------------------------------------------------
  const renderResetSent = () => (
    <motion.div
      key="reset-success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10" aria-hidden>
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
      <Button variant="outline" className="mt-2 w-full" onClick={() => switchMode("login")}>
        {t("auth.backToLogin") || "Back to Sign In"}
      </Button>
    </motion.div>
  );

  // ---------------------------------------------------------------------------
  // RENDER: Set New Password form
  // ---------------------------------------------------------------------------
  const renderResetForm = () => (
    <motion.div key="reset-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10" aria-hidden>
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
      </div>
      <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
        {t("auth.setNewPassword") || "Set New Password"}
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        {t("auth.setNewPasswordDesc") || "Enter your new password below."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput
          id="new-password"
          value={password}
          onChange={setPassword}
          placeholder={t("auth.newPasswordPlaceholder") || "Enter new password"}
          label={t("auth.newPassword") || "New Password"}
          autoComplete="new-password"
        />
        {errors.password && <p className="text-sm text-destructive" role="alert">{errors.password}</p>}

        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t("auth.confirmPassword") || "Confirm Password"}</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.confirmPasswordPlaceholder") || "Confirm new password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="ps-10"
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
            />
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive" role="alert">{errors.confirmPassword}</p>}
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{t("auth.updatingPassword") || "Updating..."}</>) : (t("auth.updatePassword") || "Update Password")}
        </Button>
      </form>
    </motion.div>
  );

  // ---------------------------------------------------------------------------
  // RENDER: Forgot Password form
  // ---------------------------------------------------------------------------
  const renderForgotForm = () => (
    <motion.div key="forgot-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10" aria-hidden>
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
      </div>
      <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
        {t("auth.forgotPassword") || "Forgot Password?"}
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        {t("auth.forgotPasswordDesc") || "Enter your email and we'll send you a reset link."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="reset-email">{t("auth.email")}</Label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="reset-email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`ps-10 pe-10 transition-colors ${
                emailCheckStatus === "valid"   ? "border-green-500 focus-visible:ring-green-500" :
                emailCheckStatus === "invalid" ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              required
              autoComplete="email"
              aria-invalid={emailCheckStatus === "invalid"}
              aria-describedby="reset-email-status"
            />
            {/* Live status icon */}
            <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {emailCheckStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />}
              {emailCheckStatus === "valid"    && <CheckCircle className="h-4 w-4 text-green-500" aria-hidden />}
              {emailCheckStatus === "invalid"  && <XCircle className="h-4 w-4 text-destructive" aria-hidden />}
            </div>
          </div>
          {/* Status message — always rendered so screen readers get updates */}
          <p
            id="reset-email-status"
            className={`text-sm ${
              emailCheckStatus === "valid"   ? "text-green-600 dark:text-green-400" :
              emailCheckStatus === "invalid" ? "text-destructive" :
              "text-muted-foreground"
            }`}
            role="status"
            aria-live="polite"
          >
            {emailCheckStatus === "checking" ? (t("auth.checkingEmail") || "Verifying email…") :
             emailCheckMsg || (errors.email ?? "")}
          </p>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{t("auth.sendingReset") || "Sending..."}</>) : (t("auth.sendResetLink") || "Send Reset Link")}
        </Button>

        <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={() => switchMode("login")}>
          <BackArrow className="me-2 h-4 w-4" aria-hidden />
          {t("auth.backToLogin") || "Back to Sign In"}
        </Button>
      </form>
    </motion.div>
  );

  // ---------------------------------------------------------------------------
  // RENDER: Login / Signup form
  // ---------------------------------------------------------------------------
  const renderAuthForm = () => (
    <motion.div key={mode + "-form"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <AnimatePresence mode="wait">
        <motion.div key={mode} variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
          <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
            {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h1>
          <p className="mb-8 text-center text-muted-foreground">
            {mode === "login" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
          </p>
        </motion.div>
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Display name (signup only) */}
        <AnimatePresence>
          {mode === "signup" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="space-y-2 pb-4">
                <Label htmlFor="displayName">{t("auth.displayName")}</Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder={t("auth.displayNamePlaceholder")}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="ps-10"
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
                {errors.displayName && <p className="text-sm text-destructive" role="alert">{errors.displayName}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role selector (signup only) */}
        <AnimatePresence>
          {mode === "signup" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="space-y-2 pb-4">
                <Label id="role-label">{t("auth.accountType") || "I want to"}</Label>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="role-label">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={role === "client"}
                    onClick={() => setRole("client")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${role === "client" ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-muted-foreground/30"}`}
                  >
                    <ShoppingBag className={`h-6 w-6 ${role === "client" ? "text-primary" : "text-muted-foreground"}`} aria-hidden />
                    <span className={`text-sm font-medium ${role === "client" ? "text-primary" : "text-muted-foreground"}`}>
                      {t("auth.roleClient") || "Shop & Buy"}
                    </span>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={role === "seller"}
                    onClick={() => setRole("seller")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${role === "seller" ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-muted-foreground/30"}`}
                  >
                    <Store className={`h-6 w-6 ${role === "seller" ? "text-primary" : "text-muted-foreground"}`} aria-hidden />
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
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ps-10"
              required
              maxLength={254}
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && <p id="email-error" className="text-sm text-destructive" role="alert">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("auth.password")}</Label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {t("auth.forgotPassword") || "Forgot password?"}
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ps-10 pe-10"
              required
              maxLength={128}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p id="password-error" className="text-sm text-destructive" role="alert">{errors.password}</p>}
        </div>

        {/* Lockout warning */}
        {isLocked && (
          <p className="text-sm text-destructive text-center" role="alert" aria-live="polite">
            {t("auth.tooManyAttempts") || "Too many attempts"} — {t("auth.tryAgainIn") || "try again in"} {lockCountdown}s
          </p>
        )}

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || isLocked} aria-busy={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{mode === "login" ? t("auth.signingIn") : t("auth.creatingAccount")}</>
          ) : mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6" role="separator" aria-hidden>
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{t("auth.orContinueWith") || "Or continue with"}</span>
        </div>
      </div>

      {/* Google sign-in */}
      <Button
        variant="outline"
        type="button"
        className="w-full"
        disabled={isGoogleLoading}
        aria-busy={isGoogleLoading}
        onClick={async () => {
          try {
            setIsGoogleLoading(true);
            const { error } = await signInWithGoogle();
            if (error) throw error;
          } catch (err: any) {
            toast({ title: t("common.error") || "Error", description: err.message || "Failed to sign in with Google", variant: "destructive" });
          } finally {
            setIsGoogleLoading(false);
          }
        }}
      >
        {isGoogleLoading ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <svg className={`${dir === "rtl" ? "ml-2" : "mr-2"} h-4 w-4`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" focusable="false">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
        )}
        {t("auth.google") || "Google"}
      </Button>

      {/* Toggle login / signup */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
        </button>
      </div>
    </motion.div>
  );

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content for keyboard / screen reader users */}
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md" id="auth-main">
          {/* Back link */}
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <BackArrow className="h-4 w-4" aria-hidden />
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
              <img src={logo} alt={t("nav.storeName") || "Store logo"} className="h-16 w-16 rounded-xl object-contain" />
            </div>

            <AnimatePresence mode="wait">
              {passwordUpdated && renderPasswordUpdated()}
              {!passwordUpdated && resetSent && renderResetSent()}
              {!passwordUpdated && !resetSent && mode === "reset"  && renderResetForm()}
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
