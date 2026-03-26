import {
  ShoppingCart, User, Menu, LogOut, Heart,
  Search, Package, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFilter } from "@/contexts/FilterContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useCart } from "@/contexts/CartContext";
import CartSheet from "@/components/CartSheet";
import logo from "@/assets/logo.jpeg";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { searchQuery, setSearchQuery } = useFilter();
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes (clicking a link)
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Skip-to-content link — only visible on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground focus:shadow-lg"
      >
        {t("nav.skipToContent") || "Skip to main content"}
      </a>

      <nav
        aria-label={t("nav.mainNavigation") || "Main navigation"}
        className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" aria-label={t("nav.storeName") || "Go to homepage"}>
            <img src={logo} alt="" className="h-12 w-12 rounded-lg object-contain" aria-hidden />
            <span className="font-display text-xl font-bold text-foreground">
              {t("nav.storeName")} <span className="text-primary">{t("nav.storeNameHighlight")}</span>
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <label htmlFor="site-search" className="sr-only">{t("search.placeholder")}</label>
              <Input
                id="site-search"
                role="searchbox"
                placeholder={t("search.placeholder")}
                className="w-full rounded-full border-border bg-muted/50 pl-10 focus:bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t("search.placeholder")}
              />
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/about">
              <Button variant="ghost" className="text-sm font-medium">{t("nav.about")}</Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" className="text-sm font-medium">{t("nav.contact")}</Button>
            </Link>
            <Link to="/seller">
              <Button variant="ghost" className="text-sm font-medium">{t("nav.sell")}</Button>
            </Link>
            <LanguageToggle />
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
              aria-label={`${t("cart.title")}${cartCount > 0 ? ` (${cartCount})` : ""}`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {cartCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  aria-hidden
                >
                  {cartCount}
                </span>
              )}
            </Button>

            <Link to="/wishlist" aria-label={t("nav.wishlist")}>
              <Button variant="ghost" size="icon" tabIndex={-1} aria-hidden>
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {user ? (
              <>
                <Link to="/orders" aria-label={t("nav.orders")}>
                  <Button variant="ghost" size="icon" tabIndex={-1} aria-hidden>
                    <Package className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/profile" aria-label={t("nav.profile")}>
                  <Button variant="ghost" size="icon" tabIndex={-1} aria-hidden>
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" aria-hidden />
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="gradient">{t("nav.signIn")}</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? (t("nav.closeMenu") || "Close menu") : (t("nav.openMenu") || "Open menu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          ref={menuRef}
          role="navigation"
          aria-label={t("nav.mobileNavigation") || "Mobile navigation"}
          hidden={!mobileMenuOpen}
          className="border-t border-border/50 bg-background p-4 md:hidden"
        >
          {/* Mobile search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <label htmlFor="mobile-search" className="sr-only">{t("search.placeholder")}</label>
            <Input
              id="mobile-search"
              placeholder={t("search.placeholder")}
              className="w-full rounded-full border-border bg-muted/50 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Link to="/" onClick={closeMobileMenu} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("nav.browse")}
            </Link>
            <Link to="/about" onClick={closeMobileMenu} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("nav.about")}
            </Link>
            <Link to="/contact" onClick={closeMobileMenu} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("nav.contact")}
            </Link>
            <Link to="/seller" onClick={closeMobileMenu} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("nav.sellSubtitle")}
            </Link>

            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link to="/orders" className="flex-1" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full gap-2">
                      <Package className="h-4 w-4" aria-hidden />{t("nav.orders")}
                    </Button>
                  </Link>
                  <Link to="/profile" className="flex-1" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full gap-2">
                      <User className="h-4 w-4" aria-hidden />{t("nav.profile")}
                    </Button>
                  </Link>
                  <Button variant="gradient" onClick={() => { handleSignOut(); closeMobileMenu(); }} className="flex-1 gap-2">
                    <LogOut className="h-4 w-4" aria-hidden />{t("nav.signOut")}
                  </Button>
                </>
              ) : (
                <Link to="/auth" className="flex-1" onClick={closeMobileMenu}>
                  <Button variant="gradient" className="w-full">{t("nav.signIn")}</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <CartSheet />
      </nav>
    </>
  );
};

export default Navbar;
