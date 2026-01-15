import { Link } from "react-router-dom";
import { Mail, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
                <span className="text-xl font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                cooking<span className="text-gradient-hero">marketplace</span>
              </span>
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">
              Your destination for premium digital home organization resources.
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
              Marketplace
            </h4>
            <ul className="space-y-2">
              {["Browse Products", "Categories", "Featured", "New Arrivals", "Best Sellers"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-display font-semibold text-foreground">
              Support
            </h4>
            <ul className="space-y-2">
              {["Help Center", "Contact Us", "FAQs", "Refund Policy", "Terms of Service", "Privacy Policy"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 font-display font-semibold text-foreground">
              Stay Updated
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Get the latest products and exclusive deals.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
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
            © 2024 cookingmarketplace. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
