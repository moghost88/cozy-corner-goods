
import React, { createContext, useContext, useState, ReactNode } from "react";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

interface FilterState {
    searchQuery: string;
    category: string;
    priceRange: [number, number];
    minRating: number;
    sortBy: SortOption;
}

interface FilterContextType extends FilterState {
    setSearchQuery: (query: string) => void;
    setCategory: (category: string) => void;
    setPriceRange: (range: [number, number]) => void;
    setMinRating: (rating: number) => void;
    setSortBy: (sort: SortOption) => void;
    resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState<SortOption>("featured");

    const resetFilters = () => {
        setSearchQuery("");
        setCategory("all");
        setPriceRange([0, 1000]);
        setMinRating(0);
        setSortBy("featured");
    };

    return (
        <FilterContext.Provider
            value={{
                searchQuery,
                setSearchQuery,
                category,
                setCategory,
                priceRange,
                setPriceRange,
                minRating,
                setMinRating,
                sortBy,
                setSortBy,
                resetFilters,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error("useFilter must be used within a FilterProvider");
    }
    return context;
};
