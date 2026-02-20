import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

  // PERFORMANCE: No blur/filter in variants — only opacity + translateY (GPU only)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background pb-16 pt-12">
      {/* CSS-only animated background blobs — no JS overhead */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="hero-blob-1 absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="hero-blob-2 absolute -right-40 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="hero-blob-3 absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {t("hero.badge")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            {t("hero.title")}{" "}
            {/* CSS gradient animation instead of JS backgroundPosition */}
            <span className="inline-block hero-gradient-text">
              {t("hero.titleHighlight")}
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-8 text-lg text-muted-foreground sm:text-xl"
          >
            {t("hero.description")}
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ willChange: "transform" }}>
              <Button
                variant="gradient"
                size="lg"
                onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
              >
                {t("hero.shopNow")}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ willChange: "transform" }}>
              <Link to="/seller">
                <Button variant="outline" size="lg">
                  {t("hero.becomeSeller")}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Popular Tags */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-sm text-muted-foreground">{t("hero.popular")}</span>
            {popularTags.map((tag, i) => (
              <motion.button
                key={tag.key}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                style={{ willChange: "transform" }}
                onClick={() => setSearchQuery(tag.search)}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                {t(tag.key)}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
