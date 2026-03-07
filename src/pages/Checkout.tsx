import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, CreditCard, Truck, ChevronLeft, ChevronRight, Loader2, Shield, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { initiatePaymobPayment } from "@/services/paymob";

const Checkout = () => {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
    const [showPaymobIframe, setShowPaymobIframe] = useState(false);
    const [iframeUrl, setIframeUrl] = useState("");

    // Form states
    const [address, setAddress] = useState({
        fullName: "",
        email: user?.email || "",
        phone: "",
        street: "",
        city: "",
        zipCode: "",
        country: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.id]: e.target.value });
    };

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('payment');
        window.scrollTo(0, 0);
    };

    // Handle Paymob card payment
    const handlePaymobPayment = async () => {
        setLoading(true);
        try {
            const nameParts = address.fullName.trim().split(" ");
            const firstName = nameParts[0] || "Customer";
            const lastName = nameParts.slice(1).join(" ") || "N/A";

            const billingData = {
                firstName,
                lastName,
                email: address.email,
                phone: address.phone || "+201000000000",
                street: address.street,
                city: address.city,
                country: address.country || "EG",
                postalCode: address.zipCode || "00000",
            };

            const cartItems = items.map((item) => ({
                id: item.id,
                name: t(`product.${item.id}.name`),
                price: item.price,
                quantity: item.quantity,
                description: t(`product.${item.id}.description`),
            }));

            const result = await initiatePaymobPayment(
                cartTotal,
                cartItems,
                billingData,
                user?.uid || "guest",
            );

            // Open Paymob iframe
            setIframeUrl(result.iframeUrl);
            setShowPaymobIframe(true);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            toast({
                title: t("common.error") || "Payment Error",
                description: error.message || "Failed to initiate payment. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle COD (Cash on Delivery)
    const handleCODPayment = async () => {
        setLoading(true);

        // Simulate order processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (user) {
            const { error } = await supabase.from('purchases').insert(
                items.map(item => ({
                    user_id: user.uid,
                    product_id: item.id,
                    product_name: t(`product.${item.id}.name`),
                    price: item.price * item.quantity,
                    purchased_at: new Date().toISOString(),
                }))
            );

            if (error) {
                console.error("Error recording purchase:", error);
            }
        }

        clearCart();
        setLoading(false);
        toast({
            title: t("checkout.successTitle") || "Order placed successfully!",
            description: t("checkout.codSuccess") || "Your order has been placed. Pay on delivery.",
        });
        navigate("/order-confirmation");
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // SECURITY: Verify user is authenticated before processing payment
        if (!user) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to complete your purchase.",
                variant: "destructive",
            });
            navigate("/auth");
            return;
        }

        if (paymentMethod === 'card') {
            await handlePaymobPayment();
        } else {
            await handleCODPayment();
        }
    };

    // Listen for Paymob iframe messages (payment complete redirect)
    const handleIframeMessage = useCallback(() => {
        // After Paymob payment, user is redirected back
        // We record the purchase and navigate to confirmation
        const recordAndNavigate = async () => {
            if (user) {
                await supabase.from('purchases').insert(
                    items.map(item => ({
                        user_id: user.uid,
                        product_id: item.id,
                        product_name: t(`product.${item.id}.name`),
                        price: item.price * item.quantity,
                        purchased_at: new Date().toISOString(),
                    }))
                );
            }
            clearCart();
            setShowPaymobIframe(false);
            toast({
                title: t("checkout.successTitle") || "Payment successful!",
                description: t("checkout.successDesc") || "Your order has been confirmed.",
            });
            navigate("/order-confirmation");
        };

        recordAndNavigate();
    }, [user, items, clearCart, navigate, toast, t]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <h1 className="font-display text-2xl font-bold">{t("cart.empty")}</h1>
                        <Button onClick={() => navigate("/")} variant="gradient">
                            {t("cart.startShopping")}
                        </Button>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background" dir={t("dir")}>
            <Navbar />

            {/* Paymob Payment iFrame Modal */}
            <AnimatePresence>
                {showPaymobIframe && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg rounded-2xl bg-card shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-500" />
                                    <span className="font-display font-semibold text-foreground">
                                        {t("checkout.securePayment") || "Secure Payment"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowPaymobIframe(false)}
                                    className="rounded-full p-1 hover:bg-muted transition-colors"
                                >
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* iFrame */}
                            <div className="w-full" style={{ height: "500px" }}>
                                <iframe
                                    src={iframeUrl}
                                    title="Paymob Payment"
                                    className="h-full w-full border-0"
                                    allow="payment"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/30">
                                <p className="text-xs text-muted-foreground">
                                    {t("checkout.paymobSecure") || "Powered by Paymob • 256-bit SSL"}
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleIframeMessage}
                                >
                                    {t("checkout.paymentDone") || "I've completed payment"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 py-8">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 font-display text-3xl font-bold"
                >
                    {t("checkout.title")}
                </motion.h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Steps Indicator */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8 flex items-center gap-4"
                        >
                            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${step === 'shipping' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                    {step === 'payment' ? <CheckCircle2 className="h-5 w-5" /> : "1"}
                                </div>
                                <span className="font-medium">{t("checkout.shipping")}</span>
                            </div>
                            <Separator className="w-10" />
                            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${step === 'payment' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                    2
                                </div>
                                <span className="font-medium">{t("checkout.payment")}</span>
                            </div>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {step === 'shipping' ? (
                                <motion.form
                                    key="shipping"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleShippingSubmit}
                                    className="space-y-6 rounded-2xl border border-border bg-card p-6"
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">{t("auth.displayName")}</Label>
                                            <Input id="fullName" required value={address.fullName} onChange={handleInputChange} placeholder={t("auth.displayNamePlaceholder")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t("auth.email")}</Label>
                                            <Input id="email" type="email" required value={address.email} onChange={handleInputChange} placeholder={t("auth.emailPlaceholder")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t("checkout.phone") || "Phone Number"}</Label>
                                        <Input id="phone" type="tel" required value={address.phone} onChange={handleInputChange} placeholder="+201234567890" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="street">{t("checkout.streetPlaceholder") || "Street Address"}</Label>
                                        <Input id="street" required value={address.street} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">{t("checkout.city") || "City"}</Label>
                                            <Input id="city" required value={address.city} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zipCode">{t("checkout.zipCode") || "Zip Code"}</Label>
                                            <Input id="zipCode" required value={address.zipCode} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">{t("checkout.country") || "Country"}</Label>
                                            <Input id="country" required value={address.country} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <Button type="submit" variant="hero" size="lg" className="w-full gap-2">
                                        {t("checkout.continueToPayment") || "Continue to Payment"}
                                        {t("dir") === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="payment"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handlePaymentSubmit}
                                    className="space-y-6 rounded-2xl border border-border bg-card p-6"
                                >
                                    <RadioGroup
                                        defaultValue="card"
                                        onValueChange={(v) => setPaymentMethod(v as 'card' | 'cod')}
                                        className="grid gap-4"
                                    >
                                        {/* Paymob Card Payment */}
                                        <motion.div
                                            whileHover={{ scale: 1.01 }}
                                            className={`flex items-center space-x-2 rtl:space-x-reverse rounded-xl border p-4 cursor-pointer transition-all duration-200 ${paymentMethod === 'card'
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <RadioGroupItem value="card" id="card" />
                                            <Label htmlFor="card" className="flex flex-1 items-center gap-3 font-medium cursor-pointer">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                    <CreditCard className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{t("checkout.payWithCard") || "Pay with Card (Paymob)"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t("checkout.paymobDesc") || "Visa, Mastercard, Meeza — Secure payment via Paymob"}
                                                    </p>
                                                </div>
                                            </Label>
                                            <div className="flex gap-1">
                                                <div className="h-6 w-9 rounded border border-border bg-white p-0.5 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-blue-700">VISA</span>
                                                </div>
                                                <div className="h-6 w-9 rounded border border-border bg-white p-0.5 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-red-600">MC</span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Cash on Delivery */}
                                        <motion.div
                                            whileHover={{ scale: 1.01 }}
                                            className={`flex items-center space-x-2 rtl:space-x-reverse rounded-xl border p-4 cursor-pointer transition-all duration-200 ${paymentMethod === 'cod'
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <RadioGroupItem value="cod" id="cod" />
                                            <Label htmlFor="cod" className="flex flex-1 items-center gap-3 font-medium cursor-pointer">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                                    <Truck className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{t("checkout.cod") || "Cash on Delivery"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t("checkout.codDesc") || "Pay when you receive your order"}
                                                    </p>
                                                </div>
                                            </Label>
                                        </motion.div>
                                    </RadioGroup>

                                    {/* Security badge */}
                                    {paymentMethod === 'card' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-3 rounded-xl bg-green-500/5 border border-green-500/20 p-4"
                                        >
                                            <Shield className="h-5 w-5 text-green-500 shrink-0" />
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                {t("checkout.secureNote") || "Your payment information is encrypted and secure. Powered by Paymob with 256-bit SSL encryption."}
                                            </p>
                                        </motion.div>
                                    )}

                                    <div className="flex gap-4">
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('shipping')}>
                                            {t("checkout.back") || "Back"}
                                        </Button>
                                        <Button type="submit" variant="hero" className="flex-[2] gap-2" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    {t("checkout.processing") || "Processing..."}
                                                </>
                                            ) : paymentMethod === 'card' ? (
                                                <>
                                                    <CreditCard className="h-4 w-4" />
                                                    {`${t("checkout.payNow") || "Pay Now"} ${t("dir") === "rtl" ? "" : "$"}${cartTotal.toFixed(2)}${t("dir") === "rtl" ? " $" : ""}`}
                                                </>
                                            ) : (
                                                `${t("checkout.placeOrder")} ${t("dir") === "rtl" ? "" : "$"}${cartTotal.toFixed(2)}${t("dir") === "rtl" ? " $" : ""}`
                                            )}
                                        </Button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm"
                    >
                        <h2 className="mb-4 font-display text-xl font-bold">{t("checkout.orderSummary")}</h2>
                        <div className="mb-4 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-md border border-border">
                                        <img src={item.image} alt={t(`product.${item.id}.name`)} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center">
                                        <h4 className="text-sm font-medium line-clamp-1">{t(`product.${item.id}.name`)}</h4>
                                        <p className="text-sm text-muted-foreground">{t("dashboard.quantity")}: {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium">{t("dir") === "rtl" ? "" : "$"}{(item.price * item.quantity).toFixed(2)}{t("dir") === "rtl" ? " $" : ""}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                                <span>{t("dir") === "rtl" ? "" : "$"}{cartTotal.toFixed(2)}{t("dir") === "rtl" ? " $" : ""}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t("checkout.shippingCost")}</span>
                                <span className="text-green-600">{t("checkout.free")}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-display font-bold">
                                <span>{t("cart.total")}</span>
                                <span>{t("dir") === "rtl" ? "" : "$"}{cartTotal.toFixed(2)}{t("dir") === "rtl" ? " $" : ""}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;
