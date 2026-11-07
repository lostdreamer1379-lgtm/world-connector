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
    res.json({ worlds });
  } catch (err) {
    console.error("[listPublicWorlds]", err);
    res.status(500).json({ error: "Failed to load worlds" });
  }
}
