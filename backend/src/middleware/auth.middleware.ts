import { NextFunction, Request, Response } from "express";
import { verifySupabaseToken } from "../services/supabase.service";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export interface AuthedRequest extends Request {
  adminUser?: { id: string; email: string };
}

/**
 * Requires a valid Supabase Auth bearer token AND that the token's email
 * is present in ADMIN_EMAILS. This is deliberately two layers: being a
 * logged-in Supabase user is not sufficient on its own to manage worlds.
 */
export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  const user = await verifySupabaseToken(token);
  if (!user || !user.email) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return res.status(403).json({ error: "This account is not authorized for admin access" });
  }

  req.adminUser = { id: user.id, email: user.email };
  next();
}
