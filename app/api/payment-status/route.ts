import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase-server";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id,payment_status,status")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ paid: false, missing: true });
  }

  return NextResponse.json({
    orderId: order.id,
    paid: order.payment_status === "paid",
    paymentStatus: order.payment_status,
    status: order.status,
  });
}
