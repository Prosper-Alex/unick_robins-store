import { ShippingRatesTable } from "@/components/admin/shipping-rates-table";
import { getAdminDeliveryRatesData } from "@/src/lib/admin-data";

export default async function AdminShippingPage() {
  const { rates, rateError } = await getAdminDeliveryRatesData();

  return <ShippingRatesTable rates={rates} dataError={rateError} />;
}
