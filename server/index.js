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

// ===== PAYMOB PAYMENT =====

// Step 1: Initiate payment — authenticates, registers order, generates payment key
app.post("/api/paymob/pay", async (req, res) => {
    try {
        const { amount, currency, items, billingData, userId } = req.body;

        if (!amount || !billingData) {
            return res.status(400).json({ error: "Missing required payment fields" });
        }

        const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
        const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
        const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

        if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
            return res.status(500).json({ error: "Paymob is not configured on the server" });
        }

        // 1. Authentication Request
        const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
        });
        const authData = await authResponse.json();

        if (!authData.token) {
            console.error("Paymob auth failed:", authData);
            return res.status(500).json({ error: "Payment authentication failed" });
        }

        const authToken = authData.token;

        // 2. Order Registration
        const amountCents = Math.round(amount * 100);
        const orderItems = (items || []).map((item) => ({
            name: item.name || "Product",
            amount_cents: Math.round((item.price || 0) * 100),
            quantity: item.quantity || 1,
            description: item.description || "",
        }));

        const orderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                auth_token: authToken,
                delivery_needed: "false",
                amount_cents: amountCents,
                currency: currency || "EGP",
                items: orderItems,
                merchant_order_id: `order_${userId}_${Date.now()}`,
            }),
        });
        const orderData = await orderResponse.json();

        if (!orderData.id) {
            console.error("Paymob order registration failed:", orderData);
            return res.status(500).json({ error: "Order registration failed" });
        }

        // 3. Payment Key Request
        const paymentKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                auth_token: authToken,
                amount_cents: amountCents,
                expiration: 3600,
                order_id: orderData.id,
                billing_data: {
                    first_name: billingData.firstName || "N/A",
                    last_name: billingData.lastName || "N/A",
                    email: billingData.email || "customer@email.com",
                    phone_number: billingData.phone || "+201000000000",
                    apartment: billingData.apartment || "N/A",
                    floor: billingData.floor || "N/A",
                    street: billingData.street || "N/A",
                    building: billingData.building || "N/A",
                    shipping_method: "N/A",
                    postal_code: billingData.postalCode || "00000",
                    city: billingData.city || "Cairo",
                    country: billingData.country || "EG",
                    state: billingData.state || "Cairo",
                },
                currency: currency || "EGP",
                integration_id: parseInt(PAYMOB_INTEGRATION_ID),
            }),
        });
        const paymentKeyData = await paymentKeyResponse.json();

        if (!paymentKeyData.token) {
            console.error("Paymob payment key failed:", paymentKeyData);
            return res.status(500).json({ error: "Payment key generation failed" });
        }

        res.json({
            paymentToken: paymentKeyData.token,
            iframeId: PAYMOB_IFRAME_ID,
            orderId: orderData.id,
            iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKeyData.token}`,
        });
    } catch (error) {
        console.error("Paymob payment error:", error);
        res.status(500).json({ error: "Payment processing failed" });
    }
});

// Step 2: Paymob transaction callback (webhook)
app.post("/api/paymob/callback", async (req, res) => {
    try {
        const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;
        const { obj, hmac } = req.body;

        // Verify HMAC if secret is configured
        if (PAYMOB_HMAC_SECRET && hmac) {
            const { createHmac } = await import("crypto");
            const concatenatedString = [
                obj.amount_cents,
                obj.created_at,
                obj.currency,
                obj.error_occured,
                obj.has_parent_transaction,
                obj.id,
                obj.integration_id,
                obj.is_3d_secure,
                obj.is_auth,
                obj.is_capture,
                obj.is_refunded,
                obj.is_standalone_payment,
                obj.is_voided,
                obj.order?.id || obj.order,
                obj.owner,
                obj.pending,
                obj.source_data?.pan || "",
                obj.source_data?.sub_type || "",
                obj.source_data?.type || "",
                obj.success,
            ].join("");

            const calculatedHmac = createHmac("sha512", PAYMOB_HMAC_SECRET)
                .update(concatenatedString)
                .digest("hex");

            if (calculatedHmac !== hmac) {
                console.error("HMAC verification failed");
                return res.status(403).json({ error: "Invalid HMAC" });
            }
        }

        // Process the payment result
        if (obj.success === true) {
            console.log(`✅ Payment successful: Order ${obj.order?.id}, Amount: ${obj.amount_cents / 100} ${obj.currency}`);

            // Store the successful transaction in Supabase
            try {
                await supabase.from("payments").insert({
                    paymob_order_id: String(obj.order?.id || obj.order),
                    paymob_transaction_id: String(obj.id),
                    amount: obj.amount_cents / 100,
                    currency: obj.currency,
                    status: "success",
                    payment_method: obj.source_data?.type || "card",
                    created_at: new Date().toISOString(),
                });
            } catch (dbError) {
                console.error("Error storing payment:", dbError);
            }
        } else {
            console.log(`❌ Payment failed: Order ${obj.order?.id}`);
        }

        res.json({ status: "received" });
    } catch (error) {
        console.error("Paymob callback error:", error);
        res.status(500).json({ error: "Callback processing failed" });
    }
});

// Step 3: Verify transaction status (called by frontend after redirect)
app.get("/api/paymob/verify/:transactionId", async (req, res) => {
    try {
        const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;

        // Get auth token
        const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
        });
        const authData = await authResponse.json();

        // Get transaction details
        const txResponse = await fetch(
            `https://accept.paymob.com/api/acceptance/transactions/${req.params.transactionId}`,
            {
                headers: {
                    "Authorization": `Bearer ${authData.token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const txData = await txResponse.json();

        res.json({
            success: txData.success,
            orderId: txData.order?.id,
            amount: txData.amount_cents / 100,
            currency: txData.currency,
            status: txData.success ? "paid" : "failed",
        });
    } catch (error) {
        console.error("Paymob verification error:", error);
        res.status(500).json({ error: "Verification failed" });
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
