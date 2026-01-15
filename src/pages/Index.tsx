import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import CreatorSpotlight from "@/components/CreatorSpotlight";
import Footer from "@/components/Footer";
import { products, Category } from "@/data/products";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Explore <span className="text-gradient-hero">Products</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the perfect digital resources for your home
            </p>
          </div>

          <div className="mb-10">
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                No products found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      <CreatorSpotlight />

      <Footer />
    </div>
  );
};

export default Index;
