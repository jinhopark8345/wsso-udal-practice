import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

type TokenResponse = { access_token: string; token_type: "bearer" };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Simulate WSSO callback: exchange for app token from backend
  const backend = process.env.BACKEND_URL ?? "http://localhost:8000";
  const r = await fetch(`${backend}/token`, { method: "POST" });
  if (!r.ok) {
    res.status(500).json({ error: "Failed to obtain token" });
    return;
  }
  const data = (await r.json()) as TokenResponse;

  // Set HttpOnly cookie on NEXT.JS domain (localhost:3000)
  // NOTE: Secure should be true in HTTPS production
  const cookie = serialize("session", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true });
}
