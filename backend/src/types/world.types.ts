import { z } from "zod";

export const openModeSchema = z.enum(["SAME_TAB", "NEW_TAB"]);

// Used for both create and update payloads in the admin API.
// slug/isActive/sortOrder have sensible server-side defaults on create.
export const worldInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers, and hyphens only"),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().nullable(),
  destinationUrl: z
    .string()
    .trim()
    .url()
    .refine((url) => /^https?:\/\//i.test(url), "destinationUrl must be http(s)")
    .refine((url) => { try { return new URL(url).username === "" && new URL(url).password === ""; } catch { return false; } }, "destinationUrl must not contain credentials"),
  artworkUrl: z.string().trim().url().optional().nullable(),
  artworkAlt: z.string().trim().max(200).optional().nullable(),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "accentColor must be a hex color like #8B8378")
    .optional()
    .nullable(),
  category: z.string().trim().max(50).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  openMode: openModeSchema.optional(),
});

export type WorldInput = z.infer<typeof worldInputSchema>;
