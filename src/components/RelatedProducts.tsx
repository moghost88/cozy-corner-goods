
import { Product, products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useMemo } from "react";

interface RelatedProductsProps {
    currentProductId: string;
    category: string;
}

const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
    const relatedItems = useMemo(() => {
        // 1. Filter by same category
        // 2. Exclude current product
        // 3. Shuffle/Randomize (simulated by slice for now) or just take first 4
        return products
            .filter((p) => p.category === category && p.id !== currentProductId)
            .slice(0, 4);
    }, [currentProductId, category]);

    if (relatedItems.length === 0) return null;

    return (
        <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold">You might also like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedItems.map((product, index) => (
                    <div key={product.id} className="scale-90 opacity-90 transition-all hover:scale-100 hover:opacity-100">
                        <ProductCard product={product} index={index} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
