// API Service - connects frontend to Node.js backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error: any) {
        console.error(`API Error [${endpoint}]:`, error.message);
        return { error: error.message };
    }
}

// ===== Products API =====
export const productsApi = {
    getAll: (params?: {
        category?: string;
        search?: string;
        sort?: string;
        page?: number;
        limit?: number;
    }) => {
        const query = new URLSearchParams();
        if (params?.category) query.set("category", params.category);
        if (params?.search) query.set("search", params.search);
        if (params?.sort) query.set("sort", params.sort);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        return apiRequest(`/products?${query.toString()}`);
    },

    getById: (id: string) => apiRequest(`/products/${id}`),

    create: (product: {
        name: string;
        description: string;
        price: number;
        category: string;
        image?: string;
        creator_id: string;
    }) =>
        apiRequest("/products", {
            method: "POST",
            body: JSON.stringify(product),
        }),

    update: (
        id: string,
        product: {
            name?: string;
            description?: string;
            price?: number;
            category?: string;
            image?: string;
        }
    ) =>
        apiRequest(`/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(product),
        }),

    delete: (id: string) =>
        apiRequest(`/products/${id}`, { method: "DELETE" }),
};

// ===== Orders API =====
export const ordersApi = {
    getByUser: (userId: string) => apiRequest(`/orders/${userId}`),

    create: (items: any[], userId: string) =>
        apiRequest("/orders", {
            method: "POST",
            body: JSON.stringify({ items, userId }),
        }),
};

// ===== Profile API =====
export const profileApi = {
    get: (userId: string) => apiRequest(`/profile/${userId}`),

    update: (
        userId: string,
        profile: { display_name?: string; avatar_url?: string }
    ) =>
        apiRequest(`/profile/${userId}`, {
            method: "PUT",
            body: JSON.stringify(profile),
        }),
};

// ===== Reviews API =====
export const reviewsApi = {
    getByProduct: (productId: string) =>
        apiRequest(`/reviews/${productId}`),

    create: (review: {
        product_id: string;
        user_id: string;
        rating: number;
        comment: string;
        user_name: string;
    }) =>
        apiRequest("/reviews", {
            method: "POST",
            body: JSON.stringify(review),
        }),
};

// ===== Newsletter API =====
export const newsletterApi = {
    subscribe: (email: string) =>
        apiRequest("/newsletter", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),
};

// ===== Health Check =====
export const healthCheck = () => apiRequest("/health");
