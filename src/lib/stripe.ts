import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-06-24.dahlia";

let stripeClient: Stripe | null = null;

export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
}

export function getStripeClient() {
  const { secretKey } = getStripeConfig();

  if (!secretKey) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY.");
  }

  // Lazy initialization keeps Next.js builds from touching runtime-only secrets.
  stripeClient ??= new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });

  return stripeClient;
}

export function toStripeSubunit(amount: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  const zeroDecimalCurrencies = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);

  return zeroDecimalCurrencies.has(normalizedCurrency)
    ? Math.round(amount)
    : Math.round(amount * 100);
}

export async function initializeStripeCheckoutSession(input: {
  reference: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (input.currency !== "USD") {
    throw new Error("Stripe checkout is currently available for USD orders only.");
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: input.reference,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          product_data: {
            name: "Unick Robins order",
            description: input.customerName,
          },
          unit_amount: toStripeSubunit(input.amount, input.currency),
        },
      },
    ],
    metadata: {
      order_id: input.orderId,
      reference: input.reference,
      provider: "stripe",
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  if (!session.url) {
    throw new Error("Unable to initialize Stripe checkout.");
  }

  return session;
}
