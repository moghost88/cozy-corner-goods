import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== SECURITY: Rate Limiter (in-memory) =====
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // per window

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }

    const requests = rateLimitMap.get(ip).filter((t) => t > windowStart);
    requests.push(now);
    rateLimitMap.set(ip, requests);

    if (requests.length > RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX_REQUESTS - requests.length));
    next();
}

// Stricter rate limit for auth-sensitive endpoints
const AUTH_RATE_LIMIT_MAX = 10; // 10 per 15 min
function authRateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `auth:${ip}`;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    if (!rateLimitMap.has(key)) {
        rateLimitMap.set(key, []);
    }

    const requests = rateLimitMap.get(key).filter((t) => t > windowStart);
    requests.push(now);
    rateLimitMap.set(key, requests);

    if (requests.length > AUTH_RATE_LIMIT_MAX) {
        return res.status(429).json({ error: "Too many authentication attempts. Please try again later." });
    }

    next();
}

// Clean up rate limit map periodically
setInterval(() => {
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    for (const [key, timestamps] of rateLimitMap.entries()) {
        const filtered = timestamps.filter((t) => t > cutoff);
        if (filtered.length === 0) {
            rateLimitMap.delete(key);
        } else {
            rateLimitMap.set(key, filtered);
        }
    }
}, 5 * 60 * 1000); // every 5 min

// ===== MIDDLEWARE =====
app.use(cors({
    origin: [
        "http://localhost:8080",
        "http://localhost:5173",
        "https://moghost88.github.io",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// SECURITY: Limit request body size to prevent DoS
app.use(express.json({ limit: "1mb" }));

// SECURITY: Set security headers on all responses
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
});

// Apply global rate limiting
app.use(rateLimit);

// Supabase Admin Client (server-side)
const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || ""
);

// ===== SECURITY: Auth Middleware =====
// Validates the JWT token from the Authorization header
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        // Attach user to request for downstream handlers
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(401).json({ error: "Unauthorized: Token verification failed" });
    }
}

// ===== SECURITY: Input Sanitization =====
// Escape special characters used in SQL LIKE patterns
function sanitizeLikeInput(input) {
    if (typeof input !== "string") return "";
    return input
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_")
        .trim()
        .substring(0, 200); // Max 200 chars to prevent abuse
}

// Basic string sanitizer — strips HTML tags and trims
function sanitizeString(input, maxLength = 500) {
    if (typeof input !== "string") return "";
    return input
        .replace(/<[^>]*>/g, "") // Strip HTML tags
        .trim()
        .substring(0, maxLength);
}

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== PRODUCTS =====

// GET all products (with optional filters) — PUBLIC
app.get("/api/products", async (req, res) => {
    try {
        const { category, search, sort, page = 1, limit = 12 } = req.query;

        // SECURITY: Validate and sanitize pagination
        const safePage = Math.max(1, Math.min(parseInt(page) || 1, 1000));
        const safeLimit = Math.max(1, Math.min(parseInt(limit) || 12, 50));

        let query = supabase.from("products").select("*", { count: "exact" });

        if (category && category !== "all") {
            query = query.eq("category", sanitizeString(String(category), 50));
        }
        if (search) {
            // SECURITY: Sanitize search to prevent SQL/LIKE injection
            const safeSearch = sanitizeLikeInput(String(search));
            if (safeSearch) {
                query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
            }
        }
        if (sort === "price-asc") query = query.order("price", { ascending: true });
        else if (sort === "price-desc") query = query.order("price", { ascending: false });
        else if (sort === "newest") query = query.order("created_at", { ascending: false });
        else query = query.order("created_at", { ascending: false });

        // Pagination
        const from = (safePage - 1) * safeLimit;
        const to = from + safeLimit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({
            products: data,
            total: count,
            page: safePage,
            totalPages: Math.ceil((count || 0) / safeLimit),
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// GET single product — PUBLIC
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

// POST create product (seller) — REQUIRES AUTH
app.post("/api/products", requireAuth, async (req, res) => {
    try {
        const { name, description, price, category, image } = req.body;

        // SECURITY: Use authenticated user's ID, not from request body
        const creator_id = req.user.id;

        if (!name || !price || !category) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate price
        const safePrice = parseFloat(price);
        if (isNaN(safePrice) || safePrice < 0 || safePrice > 999999) {
            return res.status(400).json({ error: "Invalid price" });
        }

        const { data, error } = await supabase.from("products").insert({
            name: sanitizeString(name, 200),
            description: sanitizeString(description, 2000),
            price: safePrice,
            category: sanitizeString(category, 50),
            image: image ? sanitizeString(image, 2000) : null,
            creator_id,
        }).select().single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
});

// PUT update product — REQUIRES AUTH + OWNERSHIP
app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
        // SECURITY: Verify ownership before updating
        const { data: existing } = await supabase
            .from("products")
            .select("creator_id")
            .eq("id", req.params.id)
            .single();

        if (!existing || existing.creator_id !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You don't own this product" });
        }

        const { name, description, price, category, image } = req.body;

        const safePrice = parseFloat(price);
        if (isNaN(safePrice) || safePrice < 0 || safePrice > 999999) {
            return res.status(400).json({ error: "Invalid price" });
        }

        const { data, error } = await supabase
            .from("products")
            .update({
                name: sanitizeString(name, 200),
                description: sanitizeString(description, 2000),
                price: safePrice,
                category: sanitizeString(category, 50),
                image: image ? sanitizeString(image, 2000) : null,
            })
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

// DELETE product — REQUIRES AUTH + OWNERSHIP
app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
        // SECURITY: Verify ownership before deleting
        const { data: existing } = await supabase
            .from("products")
            .select("creator_id")
            .eq("id", req.params.id)
            .single();

        if (!existing || existing.creator_id !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You don't own this product" });
        }

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

// GET user orders — REQUIRES AUTH + MUST BE OWN DATA
app.get("/api/orders/:userId", requireAuth, async (req, res) => {
    try {
        // SECURITY: Users can only access their own orders
        if (req.user.id !== req.params.userId) {
            return res.status(403).json({ error: "Forbidden: Cannot access other users' orders" });
        }

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

// POST create order — REQUIRES AUTH
app.post("/api/orders", requireAuth, async (req, res) => {
    try {
        const { items } = req.body;

        // SECURITY: Use authenticated user's ID
        const userId = req.user.id;

        if (!items?.length) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        if (items.length > 50) {
            return res.status(400).json({ error: "Too many items in cart" });
        }

        const purchases = items.map((item) => ({
            user_id: userId,
            product_id: sanitizeString(item.id, 100),
            product_name: sanitizeString(item.name, 200),
            price: Math.max(0, parseFloat(item.price) * parseInt(item.quantity) || 0),
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

// GET user profile — REQUIRES AUTH + MUST BE OWN DATA
app.get("/api/profile/:userId", requireAuth, async (req, res) => {
    try {
        if (req.user.id !== req.params.userId) {
            return res.status(403).json({ error: "Forbidden: Cannot access other users' profiles" });
        }

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

// PUT update profile — REQUIRES AUTH + MUST BE OWN DATA
app.put("/api/profile/:userId", requireAuth, async (req, res) => {
    try {
        if (req.user.id !== req.params.userId) {
            return res.status(403).json({ error: "Forbidden: Cannot modify other users' profiles" });
        }

        const { display_name, avatar_url } = req.body;
        const { data, error } = await supabase
            .from("profiles")
            .upsert({
                user_id: req.params.userId,
                display_name: sanitizeString(display_name, 100),
                avatar_url: avatar_url ? sanitizeString(avatar_url, 2000) : null,
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

// GET reviews for a product — PUBLIC
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

// POST create review — REQUIRES AUTH
app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
        const { product_id, rating, comment, user_name } = req.body;

        // SECURITY: Use authenticated user, validate rating
        const safeRating = Math.max(1, Math.min(5, parseInt(rating) || 0));
        if (!safeRating) {
            return res.status(400).json({ error: "Invalid rating (must be 1-5)" });
        }

        const { data, error } = await supabase
            .from("reviews")
            .insert({
                product_id: sanitizeString(product_id, 100),
                user_id: req.user.id,
                rating: safeRating,
                comment: sanitizeString(comment, 1000),
                user_name: sanitizeString(user_name, 100),
            })
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

// POST initiate payment — REQUIRES AUTH
app.post("/api/paymob/pay", requireAuth, async (req, res) => {
    try {
        const { amount, currency, items, billingData } = req.body;

        // SECURITY: Use authenticated user's ID
        const userId = req.user.id;

        if (!amount || !billingData) {
            return res.status(400).json({ error: "Missing required payment fields" });
        }

        // Validate amount
        const safeAmount = parseFloat(amount);
        if (isNaN(safeAmount) || safeAmount <= 0 || safeAmount > 1000000) {
            return res.status(400).json({ error: "Invalid payment amount" });
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
        const amountCents = Math.round(safeAmount * 100);
        const orderItems = (items || []).slice(0, 50).map((item) => ({
            name: sanitizeString(item.name || "Product", 200),
            amount_cents: Math.round((parseFloat(item.price) || 0) * 100),
            quantity: Math.max(1, Math.min(parseInt(item.quantity) || 1, 100)),
            description: sanitizeString(item.description || "", 500),
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
                    first_name: sanitizeString(billingData.firstName || "N/A", 50),
                    last_name: sanitizeString(billingData.lastName || "N/A", 50),
                    email: sanitizeString(billingData.email || "customer@email.com", 200),
                    phone_number: sanitizeString(billingData.phone || "+201000000000", 20),
                    apartment: "N/A",
                    floor: "N/A",
                    street: sanitizeString(billingData.street || "N/A", 200),
                    building: "N/A",
                    shipping_method: "N/A",
                    postal_code: sanitizeString(billingData.postalCode || "00000", 10),
                    city: sanitizeString(billingData.city || "Cairo", 100),
                    country: sanitizeString(billingData.country || "EG", 5),
                    state: sanitizeString(billingData.state || "Cairo", 100),
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

// Paymob transaction callback (webhook) — NO AUTH (called by Paymob servers)
app.post("/api/paymob/callback", async (req, res) => {
    try {
        const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;
        const { obj, hmac } = req.body;

        // SECURITY: HMAC verification is REQUIRED in production
        if (!PAYMOB_HMAC_SECRET) {
            console.error("PAYMOB_HMAC_SECRET not configured — rejecting callback");
            return res.status(500).json({ error: "Server misconfigured" });
        }

        if (hmac) {
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
                console.error("HMAC verification failed — potential tampering");
                return res.status(403).json({ error: "Invalid HMAC" });
            }
        } else {
            // No HMAC provided — reject
            return res.status(400).json({ error: "Missing HMAC signature" });
        }

        // Process the payment result
        if (obj.success === true) {
            console.log(`✅ Payment successful: Order ${obj.order?.id}, Amount: ${obj.amount_cents / 100} ${obj.currency}`);

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

// Verify transaction — REQUIRES AUTH
app.get("/api/paymob/verify/:transactionId", requireAuth, async (req, res) => {
    try {
        const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;

        const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
        });
        const authData = await authResponse.json();

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
app.post("/api/newsletter", authRateLimit, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== "string") return res.status(400).json({ error: "Email required" });

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 254) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        console.log(`Newsletter signup: ${sanitizeString(email, 254)}`);
        res.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("Error subscribing:", error);
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

// ===== 404 handler =====
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// ===== Error handler =====
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`
  🚀 Cozy Corner Goods API Server
  ================================
  Port:     ${PORT}
  Status:   Running (SECURED)
  Health:   http://localhost:${PORT}/api/health
  ================================
  `);
});
