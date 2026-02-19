// Paymob Payment Service — frontend client
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface PaymobBillingData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    building?: string;
    floor?: string;
    apartment?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
}

export interface PaymobPaymentResponse {
    paymentToken: string;
    iframeId: string;
    orderId: number;
    iframeUrl: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
}

/**
 * Initiate a Paymob payment via the backend.
 * Returns the iframe URL for the user to complete payment.
 */
export async function initiatePaymobPayment(
    amount: number,
    items: CartItem[],
    billingData: PaymobBillingData,
    userId: string,
    currency: string = "EGP"
): Promise<PaymobPaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/paymob/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, items, billingData, userId }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Payment initiation failed");
    }

    return response.json();
}

/**
 * Verify a transaction after redirect from Paymob iframe.
 */
export async function verifyPaymobTransaction(
    transactionId: string
): Promise<{ success: boolean; orderId: number; amount: number; currency: string; status: string }> {
    const response = await fetch(`${API_BASE_URL}/paymob/verify/${transactionId}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Verification failed");
    }

    return response.json();
}
