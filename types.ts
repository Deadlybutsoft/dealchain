
export type Category = 'All' | 'Restaurants' | 'Travel' | 'Shopping' | 'Services';

export interface Deal {
  id: number;
  title: string;
  description: string;
  category: Category;
  discountValue: string;
  originalPrice: number;
  priceUSDC: number;
  totalMint: number;
  sold: number;
  expiryDate: string; // ISO string
  image: string;
  merchantName: string;
  merchantLogo: string;
  location: string;
  terms: string;
  redemptionInstructions: string;
}

export interface Coupon {
  id: string; // Unique ID for the coupon instance
  deal: Deal;
  purchaseDate: string; // ISO string
  status: 'active' | 'used' | 'listed';
}

export interface UserProfile {
  username: string;
  avatar: string; // URL to avatar image
  bio: string;
  preferredCategory: Category | 'None';
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface Listing {
  coupon: Coupon;
  sellerUsername: string;
  sellerAvatar: string;
  resalePrice: number;
}
