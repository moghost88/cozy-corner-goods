import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CreatorSpotlight from "@/components/CreatorSpotlight";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import RecentlyViewed from "@/components/RecentlyViewed";
import { products } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFilter } from "@/contexts/FilterContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCTS_PER_PAGE = 9;

const Index = () => {
  const { t } = useLanguage();
  const { searchQuery, category, subcategory, minRating, sortBy } = useFilter();
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category === "all" || product.category === category;
        const matchesSubcategory = subcategory === "all" || product.subcategory === subcategory;
        const matchesRating = product.rating >= minRating;
        return matchesSearch && matchesCategory && matchesSubcategory && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "newest") return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
        return 0;
      });
  }, [searchQuery, category, subcategory, minRating, sortBy]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, category, subcategory, minRating, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background" dir={t("dir")}>
      <Navbar />
      <Hero />

      <main>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Desktop Sidebar */}
              <aside className={`hidden w-64 shrink-0 lg:block ${t("dir") === "rtl" ? "border-l" : "border-r"} border-border/50`}>
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
                      {t("filters.title")}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side={t("dir") === "rtl" ? "right" : "left"}>
                    <div className="mt-8">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Product Grid */}
              <div className="flex-1">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-3xl font-bold text-foreground">
                    {category === "all"
                      ? t("products.title")
                      : t("category." + category)
                    }
                    {category !== "all" && subcategory !== "all" && (
                      <span className="text-muted-foreground whitespace-pre">
                        {t("dir") === "rtl" ? " < " : " > "}{t("subcategory." + subcategory)}
                      </span>
                    )}
                    <span className="text-primary ml-2 italic">
                      ({filteredProducts.length})
                    </span>
                  </h2>
                </div>

                {paginatedProducts.length > 0 ? (
                  <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                      {paginatedProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-10 flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(page)}
                            className="h-10 w-10"
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                    <p className="text-lg font-medium text-foreground">{t("products.noResults")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("products.subtitle")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Recently Viewed Products */}
        <RecentlyViewed />

        <CreatorSpotlight />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
