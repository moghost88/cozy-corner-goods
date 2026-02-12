import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Loader2, ShoppingBag, Truck, CheckCircle, Clock } from "lucide-react";

interface Order {
    id: string;
    product_id: string;
    product_name: string;
    price: number;
    purchased_at: string;
    status?: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    processing: { icon: <Clock className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "orderHistory.statusProcessing" },
    shipped: { icon: <Truck className="h-4 w-4" />, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "orderHistory.statusShipped" },
    delivered: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "orderHistory.statusDelivered" },
};

const OrderHistory = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from("purchases")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("purchased_at", { ascending: false });

                if (error) throw error;
                // Assign random statuses for demo purposes
                const statuses = ["processing", "shipped", "delivered"];
                const ordersWithStatus = (data || []).map((order, i) => ({
                    ...order,
                    status: statuses[i % statuses.length],
                }));
                setOrders(ordersWithStatus);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    return (
        <div className="min-h-screen bg-background" dir={t("dir")}>
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-8 flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="font-display text-3xl font-bold text-foreground">
                                {t("orderHistory.title")}
                            </h1>
                            <p className="text-muted-foreground">{t("orderHistory.subtitle")}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
                            <h2 className="mb-2 text-xl font-semibold">{t("orderHistory.empty")}</h2>
                            <p className="mb-6 text-muted-foreground">{t("orderHistory.emptyDesc")}</p>
                            <Link to="/">
                                <Button variant="gradient">{t("orderHistory.startShopping")}</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const status = statusConfig[order.status || "processing"];
                                return (
                                    <div
                                        key={order.id}
                                        className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-foreground">{order.product_name}</h3>
                                                    <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                                                        {status.icon}
                                                        {t(status.label)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <span>{t("orderHistory.orderId")}: <span className="font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</span></span>
                                                    <span>{t("orderHistory.date")}: {new Date(order.purchased_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary">${order.price.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {/* Order Progress Bar */}
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{t("orderHistory.statusProcessing")}</span>
                                                <span>{t("orderHistory.statusShipped")}</span>
                                                <span>{t("orderHistory.statusDelivered")}</span>
                                            </div>
                                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all"
                                                    style={{
                                                        width: order.status === "processing" ? "33%" : order.status === "shipped" ? "66%" : "100%",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderHistory;
