import { authCookieNames, getSupabaseAdminClient, getSupabaseServerClient } from "@/src/lib/supabase-server";
import { initializePaystackTransaction } from "@/src/lib/paystack";
import type { CartItem } from "@/src/store/cart-store";
import type { Product } from "@/src/types/product";
import {
  getDisplayCurrencyForCountry,
  getProductPrice,
  getShippingFee,
} from "@/src/utils/pricing";

export type CheckoutDetails = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  deliveryMethod: string;
};

export type CheckoutResult = {
  orderId: string;
  authorizationUrl: string;
  reference: string;
};

export async function createPaystackCheckout(input: {
  items: CartItem[];
  details: CheckoutDetails;
  accessToken?: string;
  origin: string;
}): Promise<CheckoutResult> {
  const publicSupabase = getSupabaseServerClient();
  const adminSupabase = getSupabaseAdminClient();

  if (!publicSupabase || !adminSupabase) {
    throw new Error("Supabase is not configured.");
  }

  if (input.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const details = input.details;
  const customerEmail = details.email.trim().toLowerCase();
  const customerName = `${details.firstName.trim()} ${details.lastName.trim()}`.trim();
  const requiredFields = [
    customerEmail,
    customerName,
    details.phone.trim(),
    details.address.trim(),
    details.city.trim(),
    details.state.trim(),
    details.country.trim(),
    details.postalCode.trim(),
  ];

  if (requiredFields.some((value) => value.length === 0)) {
    throw new Error("Complete your contact and shipping details before payment.");
  }

  const productIds = Array.from(new Set(input.items.map((item) => item.id)));
  const pricingCurrency = getDisplayCurrencyForCountry(details.country);
  const { data: products, error: productError } = await adminSupabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (productError || !products) {
    throw new Error(productError?.message ?? "Unable to validate cart.");
  }

  const productMap = new Map((products as Product[]).map((product) => [product.id, product]));
  const normalizedItems = input.items.map((item) => {
    const product = productMap.get(item.id);

    if (!product) {
      throw new Error(`${item.title} is no longer available.`);
    }

    const quantity = normalizeCartQuantity(item.quantity);

    if (quantity > product.stock || product.stock <= 0) {
      throw new Error(`${product.title} does not have enough stock for this order.`);
    }

    return {
      id: product.id,
      title: product.title,
      price: getProductPrice(product, pricingCurrency),
      currency: pricingCurrency,
      quantity,
      image: product.image,
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = getShippingFee(pricingCurrency, details.deliveryMethod);
  const total = subtotal + shippingFee;

  let userId: string | null = null;

  if (input.accessToken) {
    const {
      data: { user },
    } = await publicSupabase.auth.getUser(input.accessToken);

    if (user) {
      userId = user.id;
    }
  }

  const reference = `UR-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  const { data, error } = await adminSupabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending_payment",
      payment_status: "unpaid",
      payment_provider: "paystack",
      payment_reference: reference,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: details.phone.trim(),
      shipping_address: {
        address: details.address.trim(),
        city: details.city.trim(),
        state: details.state.trim(),
        country: details.country.trim(),
        postalCode: details.postalCode.trim(),
      },
      delivery_method: details.deliveryMethod,
      shipping_fee: shippingFee,
      pricing_currency: pricingCurrency,
      pricing_country: details.country.trim(),
      total,
      items: normalizedItems,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const initialized = await initializePaystackTransaction({
    email: customerEmail,
    amount: total,
    currency: pricingCurrency,
    reference,
    callbackUrl: `${normalizeOrigin(input.origin)}/api/verify-payment`,
    metadata: {
      order_id: data.id,
      customer_name: customerName,
    },
  });

  return {
    orderId: data.id,
    authorizationUrl: initialized.authorization_url,
    reference,
  };
}

export function getAccessTokenFromCookieStore(cookieStore: {
  get(name: string): { value: string } | undefined;
}) {
  return cookieStore.get(authCookieNames.access)?.value;
}

function normalizeCartQuantity(value: unknown) {
  const quantity = Math.floor(Number(value));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}
