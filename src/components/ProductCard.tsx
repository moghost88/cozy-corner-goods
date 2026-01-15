import { Star, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/products";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {product.featured && (
          <Badge className="absolute left-3 top-3 bg-gradient-accent text-accent-foreground border-0">
            Featured
          </Badge>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link to={`/product/${product.id}`}>
            <Button variant="hero" size="lg" className="gap-2">
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category tag */}
        <span className="mb-2 text-xs font-medium uppercase tracking-wider text-secondary">
          {product.category}
        </span>

        <h3 className="mb-2 font-display text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {/* Creator */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-hero" />
          <span className="text-sm text-muted-foreground">{product.creator}</span>
        </div>

        {/* Stats & Price */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Download className="h-4 w-4" />
              <span className="text-sm">{product.downloads.toLocaleString()}</span>
            </div>
          </div>

          <span className="font-display text-xl font-bold text-foreground">
            ${product.price}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
