import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useFilter } from "@/contexts/FilterContext";
import { Button } from "@/components/ui/button";
import { Star, ChevronRight, ChevronDown } from "lucide-react";
import { categories } from "@/data/products";
import { useState } from "react";

interface FilterSidebarProps {
    className?: string;
}

const FilterSidebar = ({ className = "" }: FilterSidebarProps) => {
    const {
        category,
        setCategory,
        subcategory,
        setSubcategory,
        minRating,
        setMinRating,
        resetFilters,
    } = useFilter();

    const [expandedCategories, setExpandedCategories] = useState<string[]>(["kitchen-tools"]);

    const toggleExpand = (id: string) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className={`space-y-8 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground">Filters</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={resetFilters}
                >
                    Reset
                </Button>
            </div>

            <Separator />

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Department</h4>
                <div className="space-y-1">
                    {categories.map((cat) => (
                        <div key={cat.id} className="space-y-1">
                            <div
                                className={`flex items-center justify-between group cursor-pointer rounded-md px-2 py-1.5 transition-colors ${category === cat.id ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
                                    }`}
                                onClick={() => {
                                    setCategory(cat.id);
                                    setSubcategory("all");
                                }}
                            >
                                <span className={`text-sm ${category === cat.id ? "font-semibold" : "font-medium"}`}>
                                    {cat.name}
                                </span>
                                {'subcategories' in cat && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(cat.id);
                                        }}
                                        className="p-0.5 hover:bg-muted rounded text-muted-foreground"
                                    >
                                        {expandedCategories.includes(cat.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>

                            {'subcategories' in cat && expandedCategories.includes(cat.id) && (
                                <div className="ml-4 border-l border-border pl-2 space-y-1 py-1">
                                    <button
                                        onClick={() => {
                                            setCategory(cat.id);
                                            setSubcategory("all");
                                        }}
                                        className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors ${category === cat.id && subcategory === "all" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`}
                                    >
                                        All {cat.name}
                                    </button>
                                    {cat.subcategories.map((sub) => (
                                        <button
                                            key={sub.id}
                                            onClick={() => {
                                                setCategory(cat.id);
                                                setSubcategory(sub.id);
                                            }}
                                            className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors ${subcategory === sub.id ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                }`}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Rating */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Customer Review</h4>
                <div className="space-y-1">
                    {[4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${minRating === rating
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-3.5 w-3.5 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs">& Up</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
