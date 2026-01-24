
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, DollarSign, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SellerDashboard = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "kitchen",
        description: "",
        image: ""
    });

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to create a product",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.from('products').insert({
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category,
                description: formData.description,
                image: formData.image || null,
                creator_id: user.id,
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Product created successfully!",
            });

            // Reset form
            setFormData({
                name: "",
                price: "",
                category: "kitchen",
                description: "",
                image: ""
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold">Seller Dashboard</h1>
                        <p className="text-muted-foreground">Manage your products and view sales</p>
                    </div>
                    <Button variant="default">
                        <Plus className="mr-2 h-4 w-4" /> New Product
                    </Button>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="sales">Sales</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$12,345.00</div>
                                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">24</div>
                                    <p className="text-xs text-muted-foreground">+2 new this month</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="products">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Product</CardTitle>
                                <CardDescription>
                                    Fill in the details to list a new digital product on the marketplace.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateProduct} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Ultimate Meal Prep Guide"
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price ($)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <select
                                                id="category"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="kitchen">Kitchen</option>
                                                <option value="cleaning">Cleaning</option>
                                                <option value="bedroom">Bedroom</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe what's inside..."
                                            className="min-h-[120px]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="image">Image URL</Label>
                                        <Input
                                            id="image"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            For demo purposes, please paste a public image URL.
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                                        {loading ? "Creating..." : "Create Product"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
        </div>
    );
};

export default SellerDashboard;
