
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
    items: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<Product[]>(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });
    const { toast } = useToast();

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(items));
    }, [items]);

    const addToWishlist = (product: Product) => {
        setItems((prev) => {
            if (prev.some((item) => item.id === product.id)) {
                return prev;
            }
            toast({
                title: "Added to wishlist",
                description: `${product.name} has been saved for later`,
            });
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
        toast({
            title: "Removed from wishlist",
            description: "Item removed from your wishlist",
        });
    };

    const isInWishlist = (productId: string) => {
        return items.some((item) => item.id === productId);
    };

    const clearWishlist = () => setItems([]);

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
