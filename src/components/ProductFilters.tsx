import { useFilter } from "@/contexts/FilterContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const ProductFilters = () => {
    const {
        category,
        setCategory,
        priceRange,
        setPriceRange,
        minRating,
        setMinRating,
        sortBy,
        setSortBy,
    } = useFilter();
    const { t } = useLanguage();

    const categories = [
        { value: "all", label: t("categories.all") },
        { value: "home", label: t("categories.home") },
        { value: "kitchen", label: t("categories.kitchen") },
        { value: "decor", label: t("categories.decor") },
        { value: "outdoor", label: t("categories.outdoor") },
    ];

    const ratings = [
        { value: 0, label: t("filter.allRatings") },
        { value: 4, label: "4★ & Up" },
        { value: 3, label: "3★ & Up" },
    ];

    const sortOptions = [
        { value: "featured", label: t("filter.featured") },
        { value: "price-asc", label: t("filter.priceLowToHigh") },
        { value: "price-desc", label: t("filter.priceHighToLow") },
        { value: "newest", label: t("filter.newest") },
    ];

    return (
        <Card className="p-6 space-y-6 sticky top-24">
            <div>
                <h3 className="font-semibold text-lg mb-4">{t("filter.filters")}</h3>
                <Separator />
            </div>

            {/* Sort By */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">{t("filter.sortBy")}</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {/* Category */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">{t("filter.category")}</Label>
                <RadioGroup value={category} onValueChange={setCategory}>
                    {categories.map((cat) => (
                        <div key={cat.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={cat.value} id={cat.value} />
                            <Label htmlFor={cat.value} className="font-normal cursor-pointer">
                                {cat.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">{t("filter.priceRange")}</Label>
                <div className="pt-2">
                    <Slider
                        min={0}
                        max={200}
                        step={10}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Rating */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">{t("filter.rating")}</Label>
                <RadioGroup
                    value={minRating.toString()}
                    onValueChange={(value) => setMinRating(Number(value))}
                >
                    {ratings.map((rating) => (
                        <div key={rating.value} className="flex items-center space-x-2">
                            <RadioGroupItem
                                value={rating.value.toString()}
                                id={`rating-${rating.value}`}
                            />
                            <Label
                                htmlFor={`rating-${rating.value}`}
                                className="font-normal cursor-pointer"
                            >
                                {rating.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        </Card>
    );
};
