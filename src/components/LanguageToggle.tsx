import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="gap-2 font-medium"
    >
      <Globe className="h-4 w-4" />
      {language === "ar" ? "EN" : "ع"}
    </Button>
  );
};

export default LanguageToggle;
