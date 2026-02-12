import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, DollarSign, Package, Pencil, Trash2, Loader2, BarChart3, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SellerProduct {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image: string | null;
    created_at: string;
}

const SellerDashboard = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { user } = useAuth();

    // Product form state
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productImage, setProductImage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // My products state
    const [myProducts, setMyProducts] = useState<SellerProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Edit state
    const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editImage, setEditImage] = useState("");

    // Stats
    const [stats, setStats] = useState({ totalProducts: 0, totalSales: 0, totalRevenue: 0 });

    const fetchMyProducts = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("creator_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setMyProducts(data || []);
            setStats({
                totalProducts: (data || []).length,
                totalSales: Math.floor(Math.random() * 50) + 10,
                totalRevenue: (data || []).reduce((acc, p) => acc + p.price, 0) * 2.5,
            });
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, [user]);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ title: t("common.error"), description: t("seller.loginRequired"), variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("products").insert({
                name: productName,
                description: productDescription,
                price: parseFloat(productPrice),
                category: productCategory,
                image: productImage || null,
                creator_id: user.id,
            });
            if (error) throw error;
            toast({ title: t("common.success"), description: t("seller.productCreated") });
            // Reset form
            setProductName("");
            setProductDescription("");
            setProductPrice("");
            setProductCategory("");
            setProductImage("");
            fetchMyProducts();
        } catch (error: any) {
            toast({ title: t("common.error"), description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditProduct = async () => {
        if (!editingProduct) return;
        try {
            const { error } = await supabase
                .from("products")
                .update({
                    name: editName,
                    description: editDescription,
                    price: parseFloat(editPrice),
                    category: editCategory,
                    image: editImage || null,
                })
                .eq("id", editingProduct.id);
            if (error) throw error;
            toast({ title: t("common.success"), description: t("seller.productUpdated") });
            setEditingProduct(null);
            fetchMyProducts();
        } catch (error: any) {
            toast({ title: t("common.error"), description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            const { error } = await supabase.from("products").delete().eq("id", productId);
            if (error) throw error;
            toast({ title: t("common.success"), description: t("seller.productDeleted") });
            fetchMyProducts();
        } catch (error: any) {
            toast({ title: t("common.error"), description: error.message, variant: "destructive" });
        }
    };

    const startEdit = (product: SellerProduct) => {
        setEditingProduct(product);
        setEditName(product.name);
        setEditDescription(product.description || "");
        setEditPrice(product.price.toString());
        setEditCategory(product.category);
        setEditImage(product.image || "");
    };

    const categories = [
        { value: "kitchen-tools", label: t("category.kitchen-tools") },
        { value: "home-decor", label: t("category.home-decor") },
        { value: "cleaning-supplies", label: t("category.cleaning-supplies") },
    ];

    return (
        <div className="min-h-screen bg-background" dir={t("dir")}>
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-display text-3xl font-bold text-foreground">{t("seller.dashboardTitle")}</h1>
                        <p className="text-muted-foreground">{t("seller.dashboardDesc")}</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-3">
                                <Package className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t("seller.totalProducts")}</p>
                                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t("seller.totalSales")}</p>
                                    <p className="text-2xl font-bold">{stats.totalSales}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="h-8 w-8 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t("seller.totalRevenue")}</p>
                                    <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="products" className="w-full">
                        <TabsList className="mb-8 grid w-full grid-cols-2">
                            <TabsTrigger value="products">{t("seller.myProducts")}</TabsTrigger>
                            <TabsTrigger value="add">{t("seller.addProduct")}</TabsTrigger>
                        </TabsList>

                        {/* My Products Tab */}
                        <TabsContent value="products">
                            {loadingProducts ? (
                                <div className="flex min-h-[200px] items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : myProducts.length === 0 ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                                    <Package className="mb-4 h-16 w-16 text-muted-foreground/30" />
                                    <h2 className="mb-2 text-xl font-semibold">{t("seller.noProducts")}</h2>
                                    <p className="text-muted-foreground">{t("seller.noProductsDesc")}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myProducts.map((product) => (
                                        <div key={product.id} className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
                                            {editingProduct?.id === product.id ? (
                                                /* Edit Form */
                                                <div className="space-y-4">
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div>
                                                            <Label>{t("seller.productName")}</Label>
                                                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <Label>{t("dashboard.price")}</Label>
                                                            <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>{t("seller.description")}</Label>
                                                        <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                                    </div>
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div>
                                                            <Label>{t("seller.category")}</Label>
                                                            <Select value={editCategory} onValueChange={setEditCategory}>
                                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    {categories.map((cat) => (
                                                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label>{t("seller.imageUrl")}</Label>
                                                            <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button onClick={handleEditProduct}>{t("seller.saveChanges")}</Button>
                                                        <Button variant="outline" onClick={() => setEditingProduct(null)}>{t("seller.cancelEdit")}</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Product Row */
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-4">
                                                        {product.image && (
                                                            <div className="h-16 w-16 overflow-hidden rounded-lg border border-border">
                                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">{product.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{product.category} · ${product.price.toFixed(2)}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                                                            <Pencil className="mr-1 h-4 w-4" />{t("seller.edit")}
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                                            <Trash2 className="mr-1 h-4 w-4" />{t("seller.delete")}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Add Product Tab */}
                        <TabsContent value="add">
                            <div className="rounded-2xl border border-border bg-card p-8">
                                <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
                                    <Plus className="h-5 w-5 text-primary" />
                                    {t("seller.addProduct")}
                                </h2>
                                <form onSubmit={handleCreateProduct} className="space-y-6">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">{t("seller.productName")}</Label>
                                            <Input id="name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t("seller.productNamePlaceholder")} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price">{t("dashboard.price")}</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input id="price" type="number" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="pl-9" placeholder="0.00" required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">{t("seller.description")}</Label>
                                        <Textarea id="description" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder={t("seller.descriptionPlaceholder")} rows={4} />
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>{t("seller.category")}</Label>
                                            <Select value={productCategory} onValueChange={setProductCategory} required>
                                                <SelectTrigger><SelectValue placeholder={t("seller.selectCategory")} /></SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="image">{t("seller.imageUrl")}</Label>
                                            <div className="relative">
                                                <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input id="image" value={productImage} onChange={(e) => setProductImage(e.target.value)} className="pl-9" placeholder="https://..." />
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" variant="gradient" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                        {t("seller.createProduct")}
                                    </Button>
                                </form>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SellerDashboard;
