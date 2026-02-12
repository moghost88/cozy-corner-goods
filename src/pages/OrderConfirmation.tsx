import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const OrderConfirmation = () => {
    const { t } = useLanguage();
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    return (
        <div className="min-h-screen bg-background" dir={t("dir")}>
            <Navbar />
            <main className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-lg text-center">
                    {/* Success Animation */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
                            <div className="relative rounded-full bg-green-100 p-6 dark:bg-green-900/30">
                                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <h1 className="mb-4 font-display text-3xl font-bold text-foreground">
                        {t("orderConfirm.title")}
                    </h1>
                    <p className="mb-2 text-lg text-muted-foreground">
                        {t("orderConfirm.subtitle")}
                    </p>

                    {/* Order ID Card */}
                    <div className="my-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <p className="mb-1 text-sm text-muted-foreground">{t("orderConfirm.orderId")}</p>
                        <p className="font-mono text-2xl font-bold text-primary">{orderId}</p>
                    </div>

                    {/* Info Cards */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <Package className="mx-auto mb-2 h-8 w-8 text-primary" />
                            <h3 className="font-semibold">{t("orderConfirm.processingTitle")}</h3>
                            <p className="text-sm text-muted-foreground">{t("orderConfirm.processingDesc")}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-primary" />
                            <h3 className="font-semibold">{t("orderConfirm.trackTitle")}</h3>
                            <p className="text-sm text-muted-foreground">{t("orderConfirm.trackDesc")}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link to="/orders">
                            <Button variant="default" className="w-full gap-2 sm:w-auto">
                                {t("orderConfirm.viewOrders")}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/">
                            <Button variant="outline" className="w-full sm:w-auto">
                                {t("orderConfirm.continueShopping")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderConfirmation;
