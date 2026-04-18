const KHALTI_BASE_URL = (
  process.env.KHALTI_GATEWAY_URL || "https://a.khalti.com/api/v2/epayment"
).replace(/\/$/, "");

export interface KhaltiInitiatePayload {
  return_url: string;
  website_url: string;
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at?: string;
  expires_in?: number;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount?: number;
  status: string;
  transaction_id?: string;
  tidx?: string;
}

function getKhaltiSecretKey(): string {
  const key = process.env.KHALTI_SECRET_KEY;
  if (!key) {
    throw new Error("Khalti secret key is missing");
  }
  return key;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";
}

export function isKhaltiConfigured(): boolean {
  return Boolean(process.env.KHALTI_SECRET_KEY);
}

async function parseKhaltiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      return String(data.detail[0]);
    }
    if (typeof data?.error_key === "string") return data.error_key;
    return "Khalti request failed";
  } catch {
    return "Khalti request failed";
  }
}

export async function initiateKhaltiPayment(
  payload: KhaltiInitiatePayload
): Promise<KhaltiInitiateResponse> {
  const response = await fetch(`${KHALTI_BASE_URL}/initiate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${getKhaltiSecretKey()}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await parseKhaltiError(response);
    throw new Error(message);
  }

  return response.json() as Promise<KhaltiInitiateResponse>;
}

export async function lookupKhaltiPayment(pidx: string): Promise<KhaltiLookupResponse> {
  const response = await fetch(`${KHALTI_BASE_URL}/lookup/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${getKhaltiSecretKey()}`,
    },
    body: JSON.stringify({ pidx }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await parseKhaltiError(response);
    throw new Error(message);
  }

  return response.json() as Promise<KhaltiLookupResponse>;
}
