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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background pb-16 pt-12">
      {/* Animated Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, -10, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 15, -20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        />
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
            <motion.span
              className="inline-block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% auto" }}
            >
              {t("hero.titleHighlight")}
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-8 text-lg text-muted-foreground sm:text-xl"
          >
            {t("hero.description")}
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="gradient"
                size="lg"
                onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
              >
                {t("hero.shopNow")}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
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
