import { z } from "zod";

export const createOrderSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeAddress: z.string().min(1, "Store address is required"),
  storeCity: z.string().min(1, "City is required"),
  storeState: z.string().min(1, "State is required"),
  storeZip: z.string().min(1, "ZIP code is required"),
  storeLatitude: z.number(),
  storeLongitude: z.number(),
  storePlaceId: z.string().optional(),
  itemDescription: z.string().min(1, "Item description is required"),
  storeOrderId: z.string().min(1, "Order ID is required"),
  pickupName: z.string().min(1, "Pickup name is required"),
  pickupInstructions: z.string().optional(),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryCity: z.string().min(1, "City is required"),
  deliveryState: z.string().min(1, "State is required"),
  deliveryZip: z.string().min(1, "ZIP code is required"),
  deliveryLatitude: z.number(),
  deliveryLongitude: z.number(),
  deliveryPlaceId: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  distanceMiles: z.number().max(25, "Maximum delivery distance is 25 miles"),
  offerAmountCents: z
    .number()
    .min(500, "Minimum delivery offer is $5.00"),
});

export const increaseOfferSchema = z.object({
  orderId: z.string().min(1),
  newAmountCents: z.number().min(600, "Minimum offer is $6.00"),
});

export const ratingSchema = z.object({
  orderId: z.string().min(1),
  toUserId: z.string().min(1),
  stars: z.number().min(1).max(5),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type IncreaseOfferInput = z.infer<typeof increaseOfferSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
