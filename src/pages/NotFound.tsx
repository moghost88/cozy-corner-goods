import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    // Only log 404s in development to avoid leaking route info in production
    if (import.meta.env.DEV) {
      console.warn("404 — route not found:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted px-4" dir={t("dir")}>
      <div className="text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mb-3 font-display text-4xl font-bold text-foreground">
          {t("notFound.title") || "Page not found"}
        </h1>
        <p className="mb-8 text-muted-foreground">
          {t("notFound.description") || "Sorry, we couldn't find the page you're looking for."}
        </p>
        <Link to="/">
          <Button variant="gradient">{t("auth.backToHome") || "Back to Home"}</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
