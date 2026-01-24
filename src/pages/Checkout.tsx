
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, CreditCard, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Checkout = () => {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
    const [loading, setLoading] = useState(false);

    // Form states
    const [address, setAddress] = useState({
        fullName: "",
        email: "",
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

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (user) {
            const { error } = await supabase.from('purchases').insert(
                items.map(item => ({
                    user_id: user.id,
                    product_id: item.id,
                    product_name: item.name,
                    price: item.price,
                    purchased_at: new Date().toISOString(),
                }))
            );

            if (error) {
                console.error("Error recording purchase:", error);
                // We don't stop the flow here for valid demo, but in real app we would handle this
            }
        }

        clearCart();
        setLoading(false);
        toast({
            title: "Order placed successfully!",
            description: "Check your email for confirmation.",
        });
        navigate("/");
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
                    <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
                    <Button onClick={() => navigate("/")} variant="gradient">
                        Continue Shopping
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 font-display text-3xl font-bold">Checkout</h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Steps Indicator */}
                        <div className="mb-8 flex items-center gap-4">
                            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step === 'shipping' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                    {step === 'payment' ? <CheckCircle2 className="h-5 w-5" /> : "1"}
                                </div>
                                <span className="font-medium">Shipping</span>
                            </div>
                            <Separator className="w-10" />
                            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step === 'payment' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                    2
                                </div>
                                <span className="font-medium">Payment</span>
                            </div>
                        </div>

                        {step === 'shipping' ? (
                            <form onSubmit={handleShippingSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input id="fullName" required value={address.fullName} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" required value={address.email} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input id="street" required value={address.street} onChange={handleInputChange} />
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" required value={address.city} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode">Zip Code</Label>
                                        <Input id="zipCode" required value={address.zipCode} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" required value={address.country} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <Button type="submit" variant="hero" size="lg" className="w-full">
                                    Continue to Payment
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handlePaymentSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
                                <RadioGroup defaultValue="card" className="grid gap-4">
                                    <div className="flex items-center space-x-2 rounded-xl border border-border p-4 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                                        <RadioGroupItem value="card" id="card" />
                                        <Label htmlFor="card" className="flex flex-1 items-center gap-2 font-medium cursor-pointer">
                                            <CreditCard className="h-5 w-5" />
                                            Credit / Debit Card
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-xl border border-border p-4 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <Label htmlFor="cod" className="flex flex-1 items-center gap-2 font-medium cursor-pointer">
                                            <Truck className="h-5 w-5" />
                                            Cash on Delivery
                                        </Label>
                                    </div>
                                </RadioGroup>

                                <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                                    <div className="space-y-2">
                                        <Label>Card Number</Label>
                                        <Input placeholder="0000 0000 0000 0000" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Expiry Date</Label>
                                            <Input placeholder="MM/YY" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CVC</Label>
                                            <Input placeholder="123" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('shipping')}>
                                        Back
                                    </Button>
                                    <Button type="submit" variant="hero" className="flex-[2]" disabled={loading}>
                                        {loading ? "Processing..." : `Pay $${cartTotal.toFixed(2)}`}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 font-display text-xl font-bold">Order Summary</h2>
                        <div className="mb-4 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-md border border-border">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center">
                                        <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-display font-bold">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;
