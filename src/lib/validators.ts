import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "At least 6 characters"),
  username: z
    .string()
    .min(3, "Min 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores"),
  display_name: z.string().max(80, "Too long").optional().nullable(),
});

export const signInSchema = authSchema.pick({
  email: true,
  password: true,
});

export const signUpSchema = authSchema;

export const pageSchema = z.object({
  title: z.string().max(120, "Max 120 characters").optional(),
  page_date: z.string(),
  caption: z.string().max(500).optional(),
  visibility: z.enum(["private", "public", "unlisted"]),
});

export const markerSchema = z.object({
  page_id: z.string().uuid(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().min(1).max(120),
  note: z.string().max(500).optional(),
  category: z.string().max(80).optional(),
  source_date: z.string().optional(),
  source_location: z.string().max(120).optional(),
});
