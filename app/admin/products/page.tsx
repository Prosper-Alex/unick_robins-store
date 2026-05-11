import { ProductTable } from "@/components/admin/product-table";
import { getAdminStoreData } from "@/src/lib/admin-data";

export default async function AdminProductsPage() {
  const { products, productError } = await getAdminStoreData();

  return <ProductTable products={products} dataError={productError} />;
}
