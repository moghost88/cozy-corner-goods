
import { useWishlist } from "@/contexts/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Wishlist = () => {
    const { items, clearWishlist } = useWishlist();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background" dir={t("dir")}>
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            {t("nav.wishlist")}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {items.length} {t("cart.items")} {t("nav.wishlistSaved") || "saved for later"}
                        </p>
                    </div>
                    {items.length > 0 && (
                        <Button variant="outline" onClick={clearWishlist}>
                            {t("nav.clearWishlist") || "Clear Wishlist"}
                        </Button>
                    )}
                </div>

                {items.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
                            <Heart className="h-10 w-10 text-secondary" />
                        </div>
                        <h2 className="font-display text-xl font-bold">{t("nav.wishlistEmpty") || "Your wishlist is empty"}</h2>
                        <p className="max-w-md text-muted-foreground">
                            {t("nav.wishlistDescription") || "Save items you love to your wishlist to easily find them later."}
                        </p>
                        <Link to="/">
                            <Button variant="gradient">{t("footer.browseProducts")}</Button>
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Wishlist;
