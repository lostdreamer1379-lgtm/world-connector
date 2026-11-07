import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth.middleware";
import {
  createWorld,
  deleteWorld,
  listAllWorlds,
  updateWorld,
  uploadArtwork,
} from "../controllers/admin.controller";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Every route below requires a valid Supabase session belonging to an
// email in ADMIN_EMAILS.
router.use(requireAdmin);

router.get("/worlds", listAllWorlds);
router.post("/worlds", createWorld);
router.patch("/worlds/:id", updateWorld);
router.delete("/worlds/:id", deleteWorld);
router.post("/worlds/artwork", upload.single("artwork"), uploadArtwork);

export default router;
