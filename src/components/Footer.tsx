import { Link } from "react-router-dom";
import { Mail, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const { t } = useLanguage();

  const marketplaceLinks = [
    { key: "footer.browseProducts", to: "/" },
    { key: "footer.categories", to: "/" },
    { key: "footer.featured", to: "/" },
    { key: "footer.newArrivals", to: "/" },
    { key: "footer.bestSellers", to: "/" },
  ];

  const supportLinks = [
    { key: "footer.helpCenter", to: "/" },
    { key: "footer.contactUs", to: "/" },
    { key: "footer.faqs", to: "/" },
    { key: "footer.refundPolicy", to: "/" },
    { key: "footer.terms", to: "/" },
    { key: "footer.privacy", to: "/" },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-3">
              <img src={logo} alt="معرض الطباخ" className="h-12 w-12 rounded-lg object-contain" />
              <span className="font-display text-xl font-bold text-foreground">
                معرض <span className="text-primary">الطباخ</span>
              </span>
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display font-semibold text-foreground">
              {t("footer.marketplace")}
            </h4>
            <ul className="space-y-2">
              {marketplaceLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-display font-semibold text-foreground">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 font-display font-semibold text-foreground">
              {t("footer.stayUpdated")}
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("footer.newsletter")}
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="rounded-xl"
              />
              <Button variant="gradient" className="rounded-xl">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
          <div className="flex gap-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.terms")}
            </Link>
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
