import { Request, Response } from "express";
import { prisma } from "../services/prisma.service";

/**
 * Public endpoint: returns only active worlds, ordered by sortOrder.
 * This is the entire contract the Phase 2+ spatial frontend needs —
 * it must treat every entry generically with no per-world logic.
 */
export async function listPublicWorlds(_req: Request, res: Response) {
  try {
    const worlds = await prisma.world.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    // Older seeded records used "antieku" in the Vercel hostname. Normalize
    // that record at the API boundary so deployed hubs immediately emit the
    // same HTTPS origin that the Anteiku PWA is installed from.
    const normalizedWorlds = worlds.map((world) =>
      world.slug === "anteiku" && world.destinationUrl.includes("frontend-antieku.vercel.app")
        ? { ...world, destinationUrl: world.destinationUrl.replace("frontend-antieku.vercel.app", "frontend-anteiku.vercel.app") }
        : world
    );
    res.json({ worlds: normalizedWorlds });
  } catch (err) {
    console.error("[listPublicWorlds]", err);
    res.status(500).json({ error: "Failed to load worlds" });
  }
}
