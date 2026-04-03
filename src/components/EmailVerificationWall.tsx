import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MailCheck, RefreshCw, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Shown when a signed-in user's email is not yet verified.
 * Lets them resend the verification email or log out.
 * Polls Firebase every 4 seconds so the page auto-unblocks
 * as soon as the user clicks the link in their inbox.
 */
const EmailVerificationWall = () => {
  const { user, signOut, sendVerificationEmail, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading,  setCheckLoading]  = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds remaining

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Auto-poll: check if the user verified in the background (every 4 s)
  useEffect(() => {
    const id = setInterval(async () => {
      await refreshUser();
    }, 4000);
    return () => clearInterval(id);
  }, [refreshUser]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    const { error } = await sendVerificationEmail();
    setResendLoading(false);

    if (error) {
      toast({
        title: t("common.error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("auth.verificationSent") || "Email sent!",
        description: t("auth.verificationSentDesc") || "Check your inbox and spam folder.",
      });
      setResendCooldown(60); // 60-second cooldown to prevent spam
    }
  };

  const handleCheckNow = async () => {
    setCheckLoading(true);
    await refreshUser();
    setCheckLoading(false);
    // If still not verified after manual check, let the user know
    if (!user?.emailVerified) {
      toast({
        title: t("auth.notVerifiedYet") || "Not verified yet",
        description: t("auth.notVerifiedYetDesc") || "We couldn't detect a verification yet. Make sure you clicked the link in the email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card text-center"
        role="main"
        aria-labelledby="verify-heading"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
          aria-hidden
        >
          <MailCheck className="h-10 w-10 text-primary" />
        </motion.div>

        <h1
          id="verify-heading"
          className="mb-2 font-display text-2xl font-bold text-foreground"
        >
          {t("auth.verifyYourEmail") || "Verify your email"}
        </h1>

        <p className="mb-1 text-sm text-muted-foreground">
          {t("auth.verificationSentTo") || "We sent a verification link to:"}
        </p>
        <p className="mb-6 font-semibold text-foreground break-all">
          {user?.email}
        </p>

        <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground text-start space-y-1">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {t("auth.verifyStep1") || "Open the email from us in your inbox."}
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {t("auth.verifyStep2") || "Click the 'Verify email address' button."}
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {t("auth.verifyStep3") || "Return here — the page will unlock automatically."}
          </p>
        </div>

        {/* Auto-polling indicator */}
        <p className="mb-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          {t("auth.waitingVerification") || "Waiting for verification…"}
        </p>

        <div className="flex flex-col gap-3">
          {/* Manual check button */}
          <Button
            variant="hero"
            className="w-full gap-2"
            onClick={handleCheckNow}
            disabled={checkLoading}
            aria-busy={checkLoading}
          >
            {checkLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{t("auth.checking") || "Checking…"}</>
              : <><RefreshCw className="h-4 w-4" aria-hidden />{t("auth.iVerified") || "I've verified — continue"}</>
            }
          </Button>

          {/* Resend button with cooldown */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            aria-busy={resendLoading}
          >
            {resendLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{t("auth.sending") || "Sending…"}</>
              : resendCooldown > 0
              ? `${t("auth.resendIn") || "Resend in"} ${resendCooldown}s`
              : <><MailCheck className="h-4 w-4" aria-hidden />{t("auth.resendEmail") || "Resend verification email"}</>
            }
          </Button>

          {/* Sign out */}
          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t("nav.signOut") || "Sign out"}
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {t("auth.checkSpam") || "Can't find it? Check your spam or junk folder."}
        </p>
      </motion.div>
    </div>
  );
};

export default EmailVerificationWall;
