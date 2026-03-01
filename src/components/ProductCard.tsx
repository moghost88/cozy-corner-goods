import { Star, Download, ArrowRight, Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/products";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.25, 0.4, 0.25, 1],
      }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -6 }}
      style={{ willChange: "transform, opacity" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-500 hover:shadow-card-hover"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <motion.img
          src={product.image}
          alt={t(`product.${product.id}.name`)}
          width="400"
          height="300"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        />

        {/* Gradient overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        />

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isInWishlist(product.id)) {
              removeFromWishlist(product.id);
            } else {
              const added = addToWishlist(product);
              if (!added) navigate("/auth");
            }
          }}
          className={`absolute ${t("dir") === "rtl" ? "left-3" : "right-3"} top-3 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-all hover:bg-background`}
          aria-label={
            isInWishlist(product.id)
              ? t("products.removeFromWishlist")
              : t("products.addToWishlist")
          }
        >
          <Heart
            className={`h-5 w-5 transition-colors duration-300 ${isInWishlist(product.id)
              ? "fill-destructive text-destructive"
              : "text-muted-foreground"
              }`}
          />
        </motion.button>

        {product.featured && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.06 + 0.3 }}
          >
            <Badge
              className={`absolute ${t("dir") === "rtl" ? "right-3" : "left-3"} top-3 bg-gradient-accent text-accent-foreground border-0`}
            >
              {t("products.featured")}
            </Badge>
          </motion.div>
        )}

        {/* Hover Action Buttons */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-4 opacity-0 transition-all duration-300 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
          <Link to={`/product/${product.id}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="hero" size="sm" className="gap-1.5 shadow-lg">
                {t("products.viewDetails")}
                <ArrowRight
                  className={`h-3.5 w-3.5 ${t("dir") === "rtl" ? "rotate-180" : ""}`}
                />
              </Button>
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const added = addToCart(product);
                if (!added) navigate("/auth");
              }}
              aria-label={t("products.addToCart")}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category tag */}
        <span className="mb-2 text-xs font-medium uppercase tracking-wider text-secondary">
          {t(`category.${product.category}`)}
          {product.subcategory && ` • ${t(`subcategory.${product.subcategory}`)}`}
        </span>

        <h3 className="mb-2 font-display text-lg font-semibold text-foreground line-clamp-2 transition-colors duration-300 group-hover:text-primary">
          {t(`product.${product.id}.name`)}
        </h3>

        <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">
          {t(`product.${product.id}.description`)}
        </p>

        {/* Creator */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-hero" />
          <span className="text-sm text-muted-foreground">
            {t(`creator.${product.id}.name`)}
          </span>
        </div>

        {/* Stats & Price */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium text-foreground">
                {product.rating}
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Download className="h-4 w-4" />
              <span className="text-sm">
                {product.downloads.toLocaleString()}
              </span>
            </div>
          </div>

          <motion.span
            className="font-display text-xl font-bold text-foreground"
            whileHover={{ scale: 1.08 }}
            style={{ willChange: "transform", display: "inline-block" }}
          >
            {t("dir") === "rtl" ? "" : "$"}
            {product.price}
            {t("dir") === "rtl" ? " $" : ""}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
