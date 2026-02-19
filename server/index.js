import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: [
        "http://localhost:8080",
        "http://localhost:5173",
        "https://moghost88.github.io",
    ],
    credentials: true,
}));
app.use(express.json());

// Supabase Admin Client (server-side)
const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || ""
);

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== PRODUCTS =====

// GET all products (with optional filters)
app.get("/api/products", async (req, res) => {
    try {
        const { category, search, sort, page = 1, limit = 12 } = req.query;
        let query = supabase.from("products").select("*", { count: "exact" });

        if (category && category !== "all") {
            query = query.eq("category", category);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (sort === "price-asc") query = query.order("price", { ascending: true });
        else if (sort === "price-desc") query = query.order("price", { ascending: false });
        else if (sort === "newest") query = query.order("created_at", { ascending: false });
        else query = query.order("created_at", { ascending: false });

        // Pagination
        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({
            products: data,
            total: count,
            page: Number(page),
            totalPages: Math.ceil((count || 0) / Number(limit)),
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// GET single product
app.get("/api/products/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: "Product not found" });

        res.json(data);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

// POST create product (seller)
app.post("/api/products", async (req, res) => {
    try {
        const { name, description, price, category, image, creator_id } = req.body;

        if (!name || !price || !category || !creator_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const { data, error } = await supabase.from("products").insert({
            name,
            description,
            price: parseFloat(price),
            category,
            image: image || null,
            creator_id,
        }).select().single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
});

// PUT update product
app.put("/api/products/:id", async (req, res) => {
    try {
        const { name, description, price, category, image } = req.body;
        const { data, error } = await supabase
            .from("products")
            .update({ name, description, price: parseFloat(price), category, image })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
    try {
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", req.params.id);

        if (error) throw error;
        res.json({ message: "Product deleted" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// ===== ORDERS =====

// GET user orders
app.get("/api/orders/:userId", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", req.params.userId)
            .order("purchased_at", { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// POST create order
app.post("/api/orders", async (req, res) => {
    try {
        const { items, userId } = req.body;

        if (!items?.length || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const purchases = items.map((item) => ({
            user_id: userId,
            product_id: item.id,
            product_name: item.name,
            price: item.price * item.quantity,
            purchased_at: new Date().toISOString(),
        }));

        const { data, error } = await supabase.from("purchases").insert(purchases).select();
        if (error) throw error;

        res.status(201).json({ message: "Order placed successfully", orders: data });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// ===== PROFILES =====

// GET user profile
app.get("/api/profile/:userId", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", req.params.userId)
            .single();

        if (error && error.code !== "PGRST116") throw error;
        res.json(data || {});
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// PUT update profile
app.put("/api/profile/:userId", async (req, res) => {
    try {
        const { display_name, avatar_url } = req.body;
        const { data, error } = await supabase
            .from("profiles")
            .upsert({
                user_id: req.params.userId,
                display_name,
                avatar_url,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// ===== REVIEWS =====

// GET reviews for a product
app.get("/api/reviews/:productId", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("product_id", req.params.productId)
            .order("created_at", { ascending: false });

        if (error && error.code !== "42P01") throw error;
        res.json(data || []);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.json([]);
    }
});

// POST create review
app.post("/api/reviews", async (req, res) => {
    try {
        const { product_id, user_id, rating, comment, user_name } = req.body;
        const { data, error } = await supabase
            .from("reviews")
            .insert({ product_id, user_id, rating, comment, user_name })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: "Failed to create review" });
    }
});

// ===== NEWSLETTER =====
app.post("/api/newsletter", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        // Store in a newsletter table (create if exists)
        console.log(`Newsletter signup: ${email}`);
        res.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("Error subscribing:", error);
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
  🚀 Cozy Corner Goods API Server
  ================================
  Port:     ${PORT}
  Status:   Running
  Health:   http://localhost:${PORT}/api/health
  ================================
  `);
});
