import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 font-medium overflow-hidden"
    >
      <motion.div
        key="globe"
        animate={{ rotate: language === "ar" ? 0 : 180 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        style={{ display: "flex", alignItems: "center" }}
      >
        <Globe className="h-4 w-4" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.span
          key={language}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="inline-block min-w-[1.2em]"
        >
          {language === "ar" ? "EN" : "ع"}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
};

export default LanguageToggle;
