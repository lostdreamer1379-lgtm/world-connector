import "dotenv/config";
import express from "express";
import cors from "cors";
import worldsRoutes from "./routes/worlds.routes";
import adminRoutes from "./routes/admin.routes";

export const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/worlds", worldsRoutes);
app.use("/api/admin", adminRoutes);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

if (process.env.VERCEL !== "1") app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`World Connector API listening on http://localhost:${PORT}`);
});

export default app;
