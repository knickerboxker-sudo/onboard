export type PartnershipType = "cross-promotion" | "product-bundle" | "event-collab" | "wholesale" | "social-media-collab";

export type BusinessRecord = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  business_type: string;
  address: string;
  lat: number | null;
  lng: number | null;
  photos: string[] | null;
  partnership_types: string[] | null;
  products: string[] | null;
  created_at?: string;
};

export type SwipeDirection = "left" | "right";

export type SwipeFilters = {
  radiusMiles: 5 | 10 | 25 | 50;
  categories: string[];
  partnershipTypes: string[];
};
