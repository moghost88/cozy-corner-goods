import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock } from "lucide-react";

const STORAGE_KEY = "recentlyViewed";
const MAX_ITEMS = 6;

export const addToRecentlyViewed = (product: Product) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let items: Product[] = stored ? JSON.parse(stored) : [];
        // Remove if already exists
        items = items.filter((p) => p.id !== product.id);
        // Add to front
        items.unshift(product);
        // Limit
        items = items.slice(0, MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error("Error saving recently viewed:", e);
    }
};

const RecentlyViewed = () => {
    const { t } = useLanguage();
    const [items, setItems] = useState<Product[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Error loading recently viewed:", e);
        }
    }, []);

    if (items.length === 0) return null;

    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                <div className="mb-6 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        {t("recentlyViewed.title")}
                    </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {items.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="group flex-shrink-0"
                        >
                            <div className="h-32 w-32 overflow-hidden rounded-xl border border-border bg-card transition-shadow group-hover:shadow-md sm:h-40 sm:w-40">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                            <p className="mt-2 max-w-[8rem] truncate text-sm font-medium text-foreground sm:max-w-[10rem]">
                                {product.name}
                            </p>
                            <p className="text-sm font-semibold text-primary">${product.price.toFixed(2)}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
