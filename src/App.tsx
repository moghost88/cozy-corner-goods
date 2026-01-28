import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import SellerDashboard from "./pages/SellerDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const PageLoader = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <FilterProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <HashRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/seller" element={<SellerDashboard />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </HashRouter>
                </TooltipProvider>
              </FilterProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
