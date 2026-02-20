import { z } from "zod";
import { sanitizeString } from "./rate-limit";

export const ConnectionRequestSchema = z.object({
  receiver_business_id: z.string().uuid(),
  message: z.string().max(500).optional().transform((val) =>
    val ? sanitizeString(val, 500) : undefined
  ),
});

export const MessageSchema = z.object({
  match_id: z.string().uuid(),
  content: z
    .string()
    .min(1)
    .max(1000)
    .transform((val) => sanitizeString(val, 1000)),
});

export const BusinessProfileSchema = z.object({
  name: z.string().min(1).max(100).transform((val) => sanitizeString(val, 100)),
  business_type: z.string().min(1).max(50),
  address: z.string().min(1).max(300),
  description: z.string().max(1000).optional().transform((val) =>
    val ? sanitizeString(val, 1000) : undefined
  ),
  website: z.string().url().optional().or(z.literal("")),
  city: z.string().max(100).optional(),
});

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  city: z.string().max(100).optional(),
});

export const ReportSchema = z.object({
  reported_business_id: z.string().uuid(),
  reason: z.enum(["spam", "fake_business", "inappropriate_content", "harassment"]),
  details: z
    .string()
    .max(500)
    .optional()
    .transform((val) => (val ? sanitizeString(val, 500) : undefined)),
  is_block: z.boolean().optional().default(false),
});

export const CityRequestSchema = z.object({
  city: z.string().min(1).max(100).transform((val) => sanitizeString(val, 100)),
  state: z.string().max(50).optional(),
  email: z.string().email().optional(),
});

export const EmailValidationSchema = z.object({
  email: z.string().email(),
});
