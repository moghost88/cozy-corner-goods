import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

import { useFilter } from "@/contexts/FilterContext";

const Hero = () => {
  const { t } = useLanguage();
  const { setSearchQuery } = useFilter();

  const popularTags = [
    { key: "hero.tag.mealPrep", search: "Meal Prep" },
    { key: "hero.tag.organization", search: "Organization" },
    { key: "hero.tag.cleaningHacks", search: "Cleaning" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background pb-16 pt-12">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            <span className="text-sm font-medium text-foreground">
              {t("hero.badge")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t("hero.title")} <span className="text-primary">{t("hero.titleHighlight")}</span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            {t("hero.description")}
          </p>

          {/* Search Bar Removed - Moved to Navbar */}
          <div className="flex justify-center gap-4">
            <Button variant="gradient" size="lg" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
              {t("hero.shopNow")}
            </Button>
            <Button variant="outline" size="lg">
              {t("hero.becomeSeller")}
            </Button>
          </div>

          {/* Popular tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">{t("hero.popular")}</span>
            {popularTags.map((tag) => (
              <button
                key={tag.key}
                onClick={() => setSearchQuery(tag.search)}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                {t(tag.key)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
