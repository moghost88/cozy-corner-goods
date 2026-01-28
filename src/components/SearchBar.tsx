import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFilter } from "@/contexts/FilterContext";
import { useLanguage } from "@/contexts/LanguageContext";

export const SearchBar = () => {
    const { searchQuery, setSearchQuery } = useFilter();
    const { t } = useLanguage();

    return (
        <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={t("nav.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
            />
        </div>
    );
};
