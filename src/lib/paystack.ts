import crypto from "node:crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string;
    gateway_response?: string;
    channel?: string;
    customer?: {
      email?: string;
    };
  };
};

export function getPaystackConfig() {
  return {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    currency: process.env.PAYSTACK_CURRENCY ?? process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "NGN",
  };
}

export function toPaystackSubunit(amount: number) {
  return Math.round(amount * 100);
}

export async function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const { secretKey, currency } = getPaystackConfig();

  if (!secretKey) {
    throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY.");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: String(toPaystackSubunit(input.amount)),
      currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

  const result = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !result.status || !result.data?.authorization_url) {
    throw new Error(result.message || "Unable to initialize Paystack transaction.");
  }

  return result.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const { secretKey } = getPaystackConfig();

  if (!secretKey) {
    throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY.");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  const result = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !result.status || !result.data) {
    throw new Error(result.message || "Unable to verify Paystack transaction.");
  }

  return result.data;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const { secretKey } = getPaystackConfig();

  if (!secretKey || !signature) {
    return false;
  }

  const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  const expected = Buffer.from(hash);
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}
