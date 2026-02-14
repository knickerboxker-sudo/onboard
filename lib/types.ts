export interface Permit {
  id: string;
  permitNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  permitType: "Commercial" | "Residential" | "Renovation" | "New Construction";
  projectDescription: string;
  estimatedValue: number;
  filedDate: string;
  status: "Filed" | "Under Review" | "Approved" | "Started";
  contractorName?: string;
  ownerName?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
}

export interface AlertConfig {
  id: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  serviceCategories: string[];
  cities: string[];
  minPermitValue?: number;
  maxPermitValue?: number;
  permitTypes: string[];
  frequency: "Instant" | "Daily Digest" | "Weekly Digest";
}
