
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useFilter } from "@/contexts/FilterContext";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface FilterSidebarProps {
    className?: string;
}

const FilterSidebar = ({ className = "" }: FilterSidebarProps) => {
    const {
        category,
        setCategory,
        priceRange,
        setPriceRange,
        minRating,
        setMinRating,
        resetFilters,
    } = useFilter();

    const categories = [
        { id: "all", label: "All Categories" },
        { id: "Home", label: "Home & Living" },
        { id: "Kitchen", label: "Kitchen & Dining" },
        { id: "Office", label: "Office & Stationery" },
        { id: "Digital", label: "Digital Products" },
    ];

    return (
        <div className={`space-y-8 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Filters</h3>
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
                <h4 className="text-sm font-medium">Categories</h4>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={cat.id}
                                checked={category === cat.id}
                                onCheckedChange={() => setCategory(cat.id)}
                            />
                            <Label
                                htmlFor={cat.id}
                                className="text-sm font-normal text-muted-foreground peer-data-[state=checked]:font-medium peer-data-[state=checked]:text-foreground"
                            >
                                {cat.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Price Range</h4>
                    <span className="text-xs text-muted-foreground">
                        ${priceRange[0]} - ${priceRange[1]}
                    </span>
                </div>
                <Slider
                    defaultValue={[0, 1000]}
                    value={priceRange}
                    max={1000}
                    step={10}
                    onValueChange={(val) => setPriceRange(val as [number, number])}
                    className="py-4"
                />
            </div>

            <Separator />

            {/* Rating */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium">Rating</h4>
                <div className="space-y-2">
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
