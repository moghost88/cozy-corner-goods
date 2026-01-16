import { ShoppingCart, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.jpeg";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            تصفح
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            المنتجات
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            تواصل معنا
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="gradient">تسجيل الدخول</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
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
              تصفح
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground">
              المنتجات
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground">
              تواصل معنا
            </Link>
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link to="/profile" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <User className="h-4 w-4" />
                      الملف الشخصي
                    </Button>
                  </Link>
                  <Button variant="gradient" onClick={handleSignOut} className="flex-1 gap-2">
                    <LogOut className="h-4 w-4" />
                    خروج
                  </Button>
                </>
              ) : (
                <Link to="/auth" className="flex-1">
                  <Button variant="gradient" className="w-full">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
