
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    items: Product[];
    addToWishlist: (product: Product) => boolean;
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
    const { t } = useLanguage();
    const { user } = useAuth();

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(items));
    }, [items]);

    const addToWishlist = (product: Product): boolean => {
        if (!user) {
            toast({
                title: t("auth.loginRequired") || "Sign in required",
                description: t("auth.loginRequiredWishlist") || "Please sign in to add items to your wishlist.",
                variant: "destructive",
            });
            return false;
        }

        setItems((prev) => {
            if (prev.some((item) => item.id === product.id)) {
                return prev;
            }
            toast({
                title: t("wishlist.addedToWishlist") || "Added to wishlist",
                description: `${t(`product.${product.id}.name`)} ${t("cart.addedToCartDesc") || "has been saved for later"}`,
            });
            return [...prev, product];
        });
        return true;
    };

    const removeFromWishlist = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
        toast({
            title: t("wishlist.removedFromWishlist") || "Removed from wishlist",
            description: t("wishlist.removedFromWishlistDesc") || "Item removed from your wishlist",
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
