import crypto from "node:crypto";

const ESEWA_FORM_URL = (
  process.env.ESEWA_FORM_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
).replace(/\/$/, "");

const ESEWA_STATUS_URL = (
  process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/"
).replace(/\/$/, "");

const DEFAULT_SANDBOX_PRODUCT_CODE = "EPAYTEST";
const DEFAULT_SANDBOX_SECRET_KEY = "8gBm/:&EnhH.1/q";

export interface EsewaFormPayload {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export interface EsewaSuccessPayload {
  transaction_code?: string;
  status?: string;
  total_amount?: string | number;
  transaction_uuid?: string;
  product_code?: string;
  signed_field_names?: string;
  signature?: string;
}

export interface EsewaStatusResponse {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  status: string;
  ref_id: string | null;
}

interface BuildEsewaFormInput {
  amount: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
  productCode?: string;
}

interface CheckStatusInput {
  productCode: string;
  transactionUuid: string;
  totalAmount: number | string;
}

function getEsewaSecretKey(): string {
  return process.env.ESEWA_SECRET_KEY || DEFAULT_SANDBOX_SECRET_KEY;
}

function toAmountString(amount: number | string): string {
  const numeric = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(numeric)) {
    throw new Error("Invalid amount");
  }

  return numeric.toFixed(2);
}

function createSignature(message: string): string {
  return crypto.createHmac("sha256", getEsewaSecretKey()).update(message).digest("base64");
}

function buildSignedMessage(signedFieldNames: string, data: Record<string, string>): string {
  return signedFieldNames
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean)
    .map((field) => `${field}=${data[field] ?? ""}`)
    .join(",");
}

function safeTimingCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

async function parseEsewaStatusError(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.error_message === "string") {
      return data.error_message;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    return "eSewa status check failed";
  } catch {
    return "eSewa status check failed";
  }
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";
}

export function getEsewaProductCode(): string {
  return process.env.ESEWA_PRODUCT_CODE || DEFAULT_SANDBOX_PRODUCT_CODE;
}

export function getEsewaFormUrl(): string {
  return ESEWA_FORM_URL;
}

export function isEsewaConfigured(): boolean {
  return Boolean(getEsewaProductCode() && getEsewaSecretKey());
}

export function createEsewaTransactionUuid(bookingId: string): string {
  const uuid = `${bookingId}-${Date.now()}`;
  return uuid.replace(/[^A-Za-z0-9-]/g, "");
}

export function buildEsewaFormPayload(input: BuildEsewaFormInput): EsewaFormPayload {
  const totalAmount = toAmountString(input.amount);
  const productCode = input.productCode || getEsewaProductCode();
  const signedFieldNames = "total_amount,transaction_uuid,product_code";

  const signInput: Record<string, string> = {
    total_amount: totalAmount,
    transaction_uuid: input.transactionUuid,
    product_code: productCode,
  };

  const signature = createSignature(buildSignedMessage(signedFieldNames, signInput));

  return {
    amount: totalAmount,
    tax_amount: "0",
    total_amount: totalAmount,
    transaction_uuid: input.transactionUuid,
    product_code: productCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: input.successUrl,
    failure_url: input.failureUrl,
    signed_field_names: signedFieldNames,
    signature,
  };
}

export function decodeEsewaSuccessData(encodedData: string): EsewaSuccessPayload {
  const normalizedData = encodedData.replace(/ /g, "+");
  const decodedText = Buffer.from(normalizedData, "base64").toString("utf-8");

  if (!decodedText) {
    throw new Error("Empty callback payload");
  }

  return JSON.parse(decodedText) as EsewaSuccessPayload;
}

export function verifyEsewaSuccessPayload(payload: EsewaSuccessPayload): boolean {
  const signature = payload.signature;
  const signedFieldNames = payload.signed_field_names;

  if (!signature || !signedFieldNames) {
    return false;
  }

  const data: Record<string, string> = {
    transaction_code: payload.transaction_code ? String(payload.transaction_code) : "",
    status: payload.status ? String(payload.status) : "",
    total_amount:
      payload.total_amount !== undefined && payload.total_amount !== null
        ? String(payload.total_amount)
        : "",
    transaction_uuid: payload.transaction_uuid ? String(payload.transaction_uuid) : "",
    product_code: payload.product_code ? String(payload.product_code) : "",
    signed_field_names: signedFieldNames,
  };

  const generatedSignature = createSignature(buildSignedMessage(signedFieldNames, data));
  return safeTimingCompare(signature, generatedSignature);
}

export async function checkEsewaStatus(input: CheckStatusInput): Promise<EsewaStatusResponse> {
  const searchParams = new URLSearchParams({
    product_code: input.productCode,
    transaction_uuid: input.transactionUuid,
    total_amount: toAmountString(input.totalAmount),
  });

  const response = await fetch(`${ESEWA_STATUS_URL}/?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseEsewaStatusError(response));
  }

  return response.json() as Promise<EsewaStatusResponse>;
}