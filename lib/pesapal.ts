import "server-only";

/**
 * PesaPal Payment Gateway Integration
 *
 * PesaPal API v3 - supports M-Pesa, Airtel Money, Credit/Debit Cards, Bank Transfer
 *
 * Flow:
 * 1. Get auth token (POST /Auth/RequestToken)
 * 2. Register IPN URL (POST /URLSetup/RegisterIPN)
 * 3. Submit order (POST /Transactions/SubmitOrderRequest)
 * 4. Redirect user to PesaPal checkout
 * 5. PesaPal sends IPN notification on payment completion
 * 6. Query transaction status (GET /Transactions/GetTransactionStatus)
 */

const PESAPAL_ENV = process.env.PESAPAL_ENV || "sandbox";

const BASE_URL =
  PESAPAL_ENV === "production"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET || "";

// Cache token in memory (expires every ~5 minutes)
let cachedToken: { token: string; expiresAt: number } | null = null;

export interface PesaPalOrderRequest {
  id: string; // Unique merchant reference (booking ID)
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string; // IPN ID from RegisterIPN
  billing_address: {
    email_address: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    country_code?: string;
  };
}

export interface PesaPalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: { error_type: string; code: string; message: string };
  status: string;
}

export interface PesaPalTransactionStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string;
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  currency: string;
  error?: { error_type: string; code: string; message: string };
  status: string;
}

/**
 * Get authentication token from PesaPal
 */
export async function getAuthToken(): Promise<string> {
  // Return cached token if still valid (with 30s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30000) {
    return cachedToken.token;
  }

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error("PesaPal credentials not configured. Set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET.");
  }

  const response = await fetch(`${BASE_URL}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PesaPal auth failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`PesaPal auth error: ${data.error.message}`);
  }

  // Cache the token (PesaPal tokens expire in 5 minutes)
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  return data.token;
}

/**
 * Register IPN (Instant Payment Notification) URL
 * This should be called once during setup - the IPN ID is reused
 */
export async function registerIPN(
  ipnUrl: string,
  ipnNotificationType: "GET" | "POST" = "GET"
): Promise<string> {
  const token = await getAuthToken();

  const response = await fetch(`${BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: ipnNotificationType,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PesaPal IPN registration failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`PesaPal IPN error: ${data.error.message}`);
  }

  return data.ipn_id;
}

/**
 * Get registered IPN list
 */
export async function getRegisteredIPNs(): Promise<
  Array<{ url: string; ipn_id: string; notification_type: string; ipn_status: string }>
> {
  const token = await getAuthToken();

  const response = await fetch(`${BASE_URL}/api/URLSetup/GetIpnList`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get IPNs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Submit an order to PesaPal
 * Returns the redirect URL for the customer to complete payment
 */
export async function submitOrder(
  order: PesaPalOrderRequest
): Promise<PesaPalOrderResponse> {
  const token = await getAuthToken();

  const response = await fetch(
    `${BASE_URL}/api/Transactions/SubmitOrderRequest`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PesaPal order submission failed (${response.status}): ${errorText}`);
  }

  const data: PesaPalOrderResponse = await response.json();

  if (data.error) {
    throw new Error(`PesaPal order error: ${data.error.message}`);
  }

  return data;
}

/**
 * Get transaction status from PesaPal
 */
export async function getTransactionStatus(
  orderTrackingId: string
): Promise<PesaPalTransactionStatus> {
  const token = await getAuthToken();

  const response = await fetch(
    `${BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PesaPal status check failed (${response.status}): ${errorText}`);
  }

  const data: PesaPalTransactionStatus = await response.json();

  if (data.error) {
    throw new Error(`PesaPal status error: ${data.error.message}`);
  }

  return data;
}

/**
 * Map PesaPal payment method to our PaymentMethod enum
 */
export function mapPesaPalPaymentMethod(pesapalMethod: string): string {
  const methodMap: Record<string, string> = {
    "Mpesa": "MOBILE_MONEY",
    "MpesaBuyGoods": "MOBILE_MONEY",
    "MpesaPayBill": "MOBILE_MONEY",
    "Airtel": "MOBILE_MONEY",
    "Visa": "CREDIT_CARD",
    "Mastercard": "CREDIT_CARD",
    "AmericanExpress": "CREDIT_CARD",
    "Account": "BANK_TRANSFER",
    "BankTransfer": "BANK_TRANSFER",
  };

  return methodMap[pesapalMethod] || "MOBILE_MONEY";
}

/**
 * Map PesaPal status code to our TransactionPaymentStatus
 * PesaPal status codes:
 * 0 = INVALID
 * 1 = COMPLETED
 * 2 = FAILED
 * 3 = REVERSED
 */
export function mapPesaPalStatus(statusCode: number): string {
  switch (statusCode) {
    case 1:
      return "COMPLETED";
    case 2:
      return "FAILED";
    case 3:
      return "REFUNDED";
    default:
      return "PENDING";
  }
}

/**
 * Get or create the IPN notification ID
 * Registers the IPN URL with PesaPal if not already set
 */
export async function getOrCreateIPNId(): Promise<string> {
  // Check if we have a cached IPN ID in env
  if (process.env.PESAPAL_IPN_ID) {
    return process.env.PESAPAL_IPN_ID;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const ipnUrl = `${appUrl}/api/payments/pesapal/ipn`;

  // Check existing IPNs first
  try {
    const existingIPNs = await getRegisteredIPNs();
    const matching = existingIPNs.find((ipn) => ipn.url === ipnUrl);
    if (matching) {
      return matching.ipn_id;
    }
  } catch {
    // If listing fails, try to register anyway
  }

  // Register new IPN
  const ipnId = await registerIPN(ipnUrl, "GET");
  console.log(`PesaPal IPN registered: ${ipnId} -> ${ipnUrl}`);
  return ipnId;
}
