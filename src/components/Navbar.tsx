import { ShoppingCart, User, Menu, LogOut, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { searchQuery, setSearchQuery } = useFilter();

  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="معرض الطباخ" className="h-12 w-12 rounded-lg object-contain" />
          <span className="font-display text-xl font-bold text-foreground">
            معرض <span className="text-primary">الطباخ</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("nav.searchPlaceholder") || "Search products..."}
              className="w-full rounded-full border-border bg-muted/50 pl-10 focus:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>

          <Link to="/wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="gradient">{t("nav.signIn")}</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/50 bg-background p-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground">
              {t("nav.browse")}
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground">
              {t("nav.products")}
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground">
              {t("nav.contact")}
            </Link>
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link to="/profile" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <User className="h-4 w-4" />
                      {t("nav.profile")}
                    </Button>
                  </Link>
                  <Button variant="gradient" onClick={handleSignOut} className="flex-1 gap-2">
                    <LogOut className="h-4 w-4" />
                    {t("nav.signOut")}
                  </Button>
                </>
              ) : (
                <Link to="/auth" className="flex-1">
                  <Button variant="gradient" className="w-full">
                    {t("nav.signIn")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <CartSheet />
    </nav>
  );
};

export default Navbar;
