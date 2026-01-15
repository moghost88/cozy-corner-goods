import { Grid3X3, ChefHat, Sparkles, Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, categories } from "@/data/products";

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const iconMap = {
  Grid3X3,
  ChefHat,
  Sparkles,
  Bed,
};

const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((category) => {
        const Icon = iconMap[category.icon as keyof typeof iconMap];
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id as Category)}
            className={cn(
              "group flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-gradient-button text-primary-foreground shadow-lg shadow-primary/20"
                : "border border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform group-hover:scale-110",
                isActive && "animate-pulse"
              )}
            />
            {category.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
