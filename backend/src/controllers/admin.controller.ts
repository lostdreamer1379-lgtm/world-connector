import { Response } from "express";
import { prisma } from "../services/prisma.service";
import { uploadWorldArtwork } from "../services/supabase.service";
import { worldInputSchema } from "../types/world.types";
import { AuthedRequest } from "../middleware/auth.middleware";

export async function listAllWorlds(_req: AuthedRequest, res: Response) {
  const worlds = await prisma.world.findMany({ orderBy: { sortOrder: "asc" } });
  res.json({ worlds });
}

export async function createWorld(req: AuthedRequest, res: Response) {
  const parsed = worldInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid world payload", details: parsed.error.flatten() });
  }

  try {
    const existingCount = await prisma.world.count();
    const world = await prisma.world.create({
      data: {
        ...parsed.data,
        sortOrder: parsed.data.sortOrder ?? existingCount,
        isActive: parsed.data.isActive ?? true,
        openMode: parsed.data.openMode ?? "SAME_TAB",
      },
    });
    res.status(201).json({ world });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "A world with this slug already exists" });
    }
    console.error("[createWorld]", err);
    res.status(500).json({ error: "Failed to create world" });
  }
}

export async function updateWorld(req: AuthedRequest, res: Response) {
  const { id } = req.params;
  const parsed = worldInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid world payload", details: parsed.error.flatten() });
  }

  try {
    const world = await prisma.world.update({
      where: { id },
      data: parsed.data,
    });
    res.json({ world });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ error: "World not found" });
    }
    console.error("[updateWorld]", err);
    res.status(500).json({ error: "Failed to update world" });
  }
}

export async function deleteWorld(req: AuthedRequest, res: Response) {
  const { id } = req.params;
  try {
    await prisma.world.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ error: "World not found" });
    }
    console.error("[deleteWorld]", err);
    res.status(500).json({ error: "Failed to delete world" });
  }
}

/**
 * Accepts a single-file multipart upload (field name: "artwork") and a
 * `slug` field, uploads it to Supabase Storage, and returns the public URL.
 * The admin UI (Phase 5) calls this before create/update to get artworkUrl.
 */
export async function uploadArtwork(req: AuthedRequest, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  const slug = req.body?.slug as string | undefined;

  if (!file) return res.status(400).json({ error: "No file provided (field name must be 'artwork')" });
  if (!slug) return res.status(400).json({ error: "Missing 'slug' field" });

  try {
    const publicUrl = await uploadWorldArtwork({
      slug,
      fileBuffer: file.buffer,
      contentType: file.mimetype,
      originalFilename: file.originalname,
    });
    res.json({ artworkUrl: publicUrl });
  } catch (err) {
    console.error("[uploadArtwork]", err);
    res.status(500).json({ error: "Artwork upload failed" });
  }
}
