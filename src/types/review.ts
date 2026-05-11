export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  body: string;
  created_at: string;
};
