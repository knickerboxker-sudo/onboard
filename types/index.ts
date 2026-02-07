import { OrderStatus, UserRole, DriverStatus, BackgroundCheckStatus } from "@prisma/client";

export type { OrderStatus, UserRole, DriverStatus, BackgroundCheckStatus };

export interface PriceChange {
  amount: number;
  timestamp: string;
}

export interface OrderWithRelations {
  id: string;
  customerId: string;
  driverId: string | null;
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storeZip: string;
  storeLatitude: number;
  storeLongitude: number;
  storePlaceId: string | null;
  itemDescription: string;
  itemPhotoUrl: string | null;
  storeOrderId: string;
  pickupName: string;
  pickupInstructions: string | null;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryPlaceId: string | null;
  deliveryInstructions: string | null;
  distanceMiles: number;
  offerAmountCents: number;
  priceHistory: PriceChange[];
  driverEarningsCents: number | null;
  status: OrderStatus;
  stripePaymentIntentId: string | null;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  customer?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  driver?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    driverProfile?: {
      averageRating: number;
      totalDeliveries: number;
      vehicleMake: string | null;
      vehicleModel: string | null;
      vehicleColor: string | null;
    };
  } | null;
}

export interface CreateOrderInput {
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storeZip: string;
  storeLatitude: number;
  storeLongitude: number;
  storePlaceId?: string;
  itemDescription: string;
  storeOrderId: string;
  pickupName: string;
  pickupInstructions?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryPlaceId?: string;
  deliveryInstructions?: string;
  distanceMiles: number;
  offerAmountCents: number;
}
