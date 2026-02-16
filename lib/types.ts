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
  operating_hours?: string | null;
  website?: string | null;
  social_links?: string[] | null;
  // Social proof & demographics
  follower_count?: number;
  email_list_size?: number;
  monthly_foot_traffic?: number;
  target_age_min?: number | null;
  target_age_max?: number | null;
  target_income_bracket?: string | null;
  customer_interests?: string[] | null;
  // Verification & trust
  verified?: boolean;
  years_in_operation?: number | null;
  successful_partnerships_count?: number;
  // Subscription
  subscription_tier?: "free" | "pro" | "premium";
  daily_swipes_used?: number;
  last_swipe_reset_at?: string | null;
  // Activity
  last_active_at?: string | null;
  avg_response_time_minutes?: number | null;
  created_at?: string;
};

export type SwipeDirection = "left" | "right";

export type SwipeFilters = {
  radiusMiles: 5 | 10 | 25 | 50;
  categories: string[];
  partnershipTypes: string[];
};

// Partnership outcome tracking
export type PartnershipStatus = "active" | "paused" | "completed" | "cancelled";

export type PartnershipRecord = {
  id: string;
  match_id: string;
  partnership_type: string;
  start_date: string;
  end_date: string | null;
  revenue_generated: number;
  customers_acquired: number;
  status: PartnershipStatus;
  success_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Business verification
export type VerificationType = "business_license" | "storefront_photo" | "tax_id" | "social_media" | "website";
export type VerificationStatus = "pending" | "approved" | "rejected";

export type VerificationRecord = {
  id: string;
  business_id: string;
  verification_type: VerificationType;
  document_url: string | null;
  status: VerificationStatus;
  reviewer_notes: string | null;
  submitted_at: string;
  verified_at: string | null;
};

// Trust badges
export type TrustBadge = {
  type: "verified" | "established" | "top_partner" | "fast_responder";
  label: string;
  description: string;
};

// Profile views
export type ProfileViewRecord = {
  id: string;
  viewer_business_id: string;
  viewed_business_id: string;
  viewed_at: string;
};

// Reviews
export type ReviewRecord = {
  id: string;
  partnership_id: string;
  reviewer_business_id: string;
  reviewed_business_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

// Reports
export type ReportRecord = {
  id: string;
  reporter_business_id: string;
  reported_business_id: string;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "resolved";
  is_block: boolean;
  created_at: string;
};

// Saved assessments
export type SavedAssessmentRecord = {
  id: string;
  match_id: string | null;
  creator_business_id: string;
  business_a_percent: number;
  business_b_percent: number;
  scenario: string;
  proposed_split_a: number | null;
  notes: string | null;
  shared_with_match: boolean;
  created_at: string;
};

// Subscription tiers
export type SubscriptionTier = "free" | "pro" | "premium";

export type TierLimits = {
  dailySwipes: number;
  canSeeWhoLiked: boolean;
  prioritySearch: boolean;
  advancedAnalytics: boolean;
  partnershipTemplates: boolean;
  boostProfile: boolean;
};

// Partnership templates for post-match guidance
export type PartnershipTemplate = {
  id: string;
  name: string;
  type: PartnershipType;
  description: string;
  terms: string[];
  suggestedSplit: string;
};

// Icebreaker prompts
export type IcebreakerPrompt = {
  id: string;
  partnershipType: PartnershipType;
  prompt: string;
};
