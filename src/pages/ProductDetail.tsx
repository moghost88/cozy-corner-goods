import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Star, Download, ShoppingCart, Heart, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { addToRecentlyViewed } from "@/components/RecentlyViewed";
import ReviewList from "@/components/reviews/ReviewList";
import RelatedProducts from "@/components/RelatedProducts";


const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background" dir={t("dir")}>
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 font-display text-2xl font-bold text-foreground">
              {t("products.noResults")}
            </h1>
            <Link to="/">
              <Button variant="gradient">{t("auth.backToHome")}</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const features = [
    t("product.feature1") || "Instant digital download",
    t("product.feature2") || "Printable PDF format",
    t("product.feature3") || "Lifetime access",
    t("product.feature4") || "Free updates included",
  ];

  return (
    <div className="min-h-screen bg-background" dir={t("dir")}>
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t("category." + product.category), to: "/" },
            { label: t(`product.${product.id}.name`) },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Product Preview */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="aspect-square overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
                <img
                  src={product.image}
                  alt={t(`product.${product.id}.name`)}
                  className="h-full w-full object-cover"
                />
              </div>

              {product.featured && (
                <Badge className={`absolute ${t("dir") === "rtl" ? "right-4" : "left-4"} top-4 bg-gradient-accent border-0 text-accent-foreground`}>
                  {t("products.featured")}
                </Badge>
              )}

              {/* Action buttons */}
              <div className={`absolute ${t("dir") === "rtl" ? "left-4" : "right-4"} top-4 flex gap-2`}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-card/80 backdrop-blur-sm"
                  onClick={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                  aria-label={isInWishlist(product.id) ? t("products.removeFromWishlist") : t("products.addToWishlist")}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-destructive text-destructive" : ""}`} />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full bg-card/80 backdrop-blur-sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category */}
            <span className="mb-2 text-sm font-medium uppercase tracking-wider text-secondary">
              {t(`category.${product.category}`)}
            </span>

            <h1 className="mb-4 font-display text-3xl font-bold text-foreground lg:text-4xl">
              {t(`product.${product.id}.name`)}
            </h1>

            {/* Creator & Stats */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-hero" />
                <span className="text-sm font-medium text-foreground">
                  {t(`creator.${product.id}.name`)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-medium text-foreground">{product.rating}</span>
                <span className="text-muted-foreground">(120 {t("dashboard.reviews")})</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>{product.downloads.toLocaleString()} {t("products.downloads")}</span>
              </div>
            </div>

            {/* Description */}
            <p className="mb-8 text-lg text-muted-foreground">
              {t(`product.${product.id}.description`)}
            </p>

            {/* Features */}
            <div className="mb-8 rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="mb-4 font-display font-semibold text-foreground">
                {t("product.whatsIncluded") || "What's included:"}
              </h3>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/20">
                      <Check className="h-3 w-3 text-secondary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price & CTA */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">{t("dashboard.price")}</span>
                  <p className="font-display text-4xl font-bold text-foreground">
                    {t("dir") === "rtl" ? "" : "$"}{product.price}{t("dir") === "rtl" ? " $" : ""}
                  </p>
                </div>
                <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium text-secondary">
                  {t("product.oneTimePurchase") || "One-time purchase"}
                </span>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="mb-3 w-full gap-2"
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="h-5 w-5" />
                {t("products.addToCart")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t("product.secureCheckout") || "Secure checkout powered by Stripe"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-16 px-4 pb-16 space-y-16">
        <RelatedProducts currentProductId={product.id} category={product.category} />
        <ReviewList productId={product.id} />
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
