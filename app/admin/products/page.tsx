import { ProductTable } from "@/components/admin/product-table";
import { getProducts } from "@/src/services/products";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return <ProductTable products={products} />;
}
