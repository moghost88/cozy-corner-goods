import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CreatorSpotlight from "@/components/CreatorSpotlight";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import { products, categories } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFilter } from "@/contexts/FilterContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  const { searchQuery, category, subcategory, minRating, sortBy } = useFilter();

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search Filter
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Category Filter
        const matchesCategory = category === "all" || product.category === category;

        // Subcategory Filter
        const matchesSubcategory = subcategory === "all" || product.subcategory === subcategory;

        // Rating Filter
        const matchesRating = product.rating >= minRating;

        return matchesSearch && matchesCategory && matchesSubcategory && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "newest") return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
        return 0; // featured/default
      });
  }, [searchQuery, category, subcategory, minRating, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Reduced Hero without search bar since it's in Navbar now */}
      <Hero />

      <main>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Desktop Sidebar */}
              <aside className="hidden w-64 shrink-0 lg:block">
                <div className="sticky top-24">
                  <FilterSidebar />
                </div>
              </aside>

              {/* Mobile Filter Sheet */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="mt-8">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Product Grid */}
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="font-display text-3xl font-bold text-foreground">
                    {category === "all"
                      ? t("products.title")
                      : (categories.find(c => c.id === category)?.name || category)
                    }
                    {category !== "all" && subcategory !== "all" && (
                      <span className="text-muted-foreground whitespace-pre">
                        {" > "}{
                          (categories.find(c => c.id === category) as any)?.subcategories?.find((s: any) => s.id === subcategory)?.name
                        }
                      </span>
                    )}
                    <span className="text-primary ml-2">
                      ({filteredProducts.length})
                    </span>
                  </h2>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {filteredProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                    <p className="text-lg font-medium text-foreground">No products found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or search query.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <CreatorSpotlight />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
