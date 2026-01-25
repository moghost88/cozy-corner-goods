
import React, { createContext, useContext, useState, ReactNode } from "react";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

interface FilterState {
    searchQuery: string;
    category: string;
    subcategory: string;
    minRating: number;
    sortBy: SortOption;
}

interface FilterContextType extends FilterState {
    setSearchQuery: (query: string) => void;
    setCategory: (category: string) => void;
    setSubcategory: (subcategory: string) => void;
    setMinRating: (rating: number) => void;
    setSortBy: (sort: SortOption) => void;
    resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [subcategory, setSubcategory] = useState("all");
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState<SortOption>("featured");

    const resetFilters = () => {
        setSearchQuery("");
        setCategory("all");
        setSubcategory("all");
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
                subcategory,
                setSubcategory,
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
