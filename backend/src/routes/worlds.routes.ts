import { Router } from "express";
import { listPublicWorlds } from "../controllers/worlds.controller";

const router = Router();

// GET /api/worlds — public, active worlds only, ordered for the spatial UI
router.get("/", listPublicWorlds);

export default router;
