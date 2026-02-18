export type PartnershipType = "cross-promotion" | "product-bundle" | "event-collab" | "wholesale" | "social-media-collab";

export type CollaborationIntent = "sell" | "promote" | "supply" | "co-brand" | "refer";

export type PartnershipInterestTag =
  | "Events"
  | "Cross-Promotion"
  | "Product Placement"
  | "Revenue Share"
  | "Referral Program"
  | "Joint Marketing"
  | "Space Sharing"
  | "Equipment Sharing"
  | "Bulk Purchasing";

export const PARTNERSHIP_INTEREST_TAGS: PartnershipInterestTag[] = [
  "Events",
  "Cross-Promotion",
  "Product Placement",
  "Revenue Share",
  "Referral Program",
  "Joint Marketing",
  "Space Sharing",
  "Equipment Sharing",
  "Bulk Purchasing",
];

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
  collaboration_intents?: string[] | null;
  products: string[] | null;
  operating_hours?: string | null;
  website?: string | null;
  social_links?: string[] | null;
  // Enhanced profile sections
  looking_for?: string[] | null;
  can_offer?: string[] | null;
  partnership_ideas?: string[] | null;
  partnership_interest_tags?: string[] | null;
  business_story?: string | null;
  business_goals?: string | null;
  business_values?: string[] | null;
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
  // Activity
  last_active_at?: string | null;
  avg_response_time_minutes?: number | null;
  created_at?: string;
  // City-based launch system
  city?: string | null;
  state?: string | null;
};

// Connection request system
export type ConnectionRequestStatus = "pending" | "accepted" | "declined";

export type ConnectionRequestRecord = {
  id: string;
  sender_business_id: string;
  receiver_business_id: string;
  message: string | null;
  status: ConnectionRequestStatus;
  created_at: string;
  updated_at: string;
};



// Partnership outcome tracking
export type PartnershipStatus = "pending" | "active" | "paused" | "completed" | "cancelled" | "archived";

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

// Partnership templates for post-match guidance
export type PartnershipTemplate = {
  id: string;
  name: string;
  type: PartnershipType;
  description: string;
  terms: string[];
  suggestedSplit: string;
};



// Notification types
export type NotificationType = 'match' | 'message' | 'partnership_update' | 'verification' | 'system';

export type NotificationRecord = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  in_app: boolean;
};

// Partnership agreement types
export type AgreementStatus = 'draft' | 'pending_review' | 'approved' | 'signed' | 'expired';

export type AgreementClause = {
  id: string;
  title: string;
  content: string;
  isCustom: boolean;
};

export type AgreementContent = {
  clauses: AgreementClause[];
  revenueSplitA: number;
  revenueSplitB: number;
  startDate: string;
  endDate: string;
  customTerms: string;
  signatureA: string;
  signatureB: string;
};

export type PartnershipAgreementRecord = {
  id: string;
  match_id: string | null;
  partnership_id: string | null;
  creator_business_id: string;
  partner_business_id: string | null;
  title: string;
  partnership_type: string;
  status: AgreementStatus;
  content: AgreementContent;
  version: number;
  created_at: string;
  updated_at: string;
};

// Partnership milestone types
export type MilestoneType = 'first_sale' | 'revenue_threshold' | 'customer_goal' | 'duration_milestone' | 'custom';

export type PartnershipMilestoneRecord = {
  id: string;
  partnership_id: string;
  type: MilestoneType;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  completed_at: string | null;
  celebrated: boolean;
  created_at: string;
};

export type PartnershipHealthScore = {
  score: number;
  level: 'healthy' | 'moderate' | 'needs_attention';
  factors: {
    label: string;
    value: number;
    max: number;
  }[];
};

// Referral types
export type ReferralStatus = 'invited' | 'signed_up' | 'first_match' | 'active_partnership';

export type ReferralRecord = {
  id: string;
  referrer_business_id: string;
  referred_email: string;
  referred_business_id: string | null;
  status: ReferralStatus;
  reward_earned: boolean;
  created_at: string;
};
