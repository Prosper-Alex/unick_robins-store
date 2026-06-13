export function formatOrderId(id: string) {
  const cleanId = id.replace(/-/g, "").toUpperCase();
  return `UR-${cleanId.slice(0, 4)}-${cleanId.slice(4, 10)}`;
}

export function normalizeOrderDisplayId(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function isPendingPaymentOrder(status: string, paymentStatus: string) {
  return status === "pending_payment" && ["unpaid", "pending", "abandoned"].includes(paymentStatus);
}
