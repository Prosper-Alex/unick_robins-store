export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  title: string | null;
  rating: number;
  body: string;
  verified_purchase: boolean;
  status: string;
  created_at: string;
};
